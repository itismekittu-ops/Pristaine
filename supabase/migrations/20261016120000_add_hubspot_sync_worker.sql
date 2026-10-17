-- Pristaine HubSpot sync worker queue claim function.
-- This function only claims lead/upsert_contact jobs; bookings and chat summaries
-- are deliberately not sent to HubSpot by this first integration phase.

CREATE OR REPLACE FUNCTION public.claim_hubspot_sync_jobs(p_batch_size integer DEFAULT 10)
RETURNS SETOF public.crm_sync_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_batch_size integer := LEAST(GREATEST(COALESCE(p_batch_size, 10), 1), 10);
BEGIN
  -- Do not leave a crashed final attempt stuck forever in in_progress.
  UPDATE public.crm_sync_log
  SET status = 'exhausted',
      error_code = 'worker_timeout_max_attempts',
      next_retry_at = NULL,
      updated_at = clock_timestamp()
  WHERE record_type = 'lead'
    AND action = 'upsert_contact'
    AND status = 'in_progress'
    AND attempts >= max_attempts
    AND updated_at < clock_timestamp() - INTERVAL '15 minutes';

  RETURN QUERY
  WITH candidates AS (
    SELECT q.id
    FROM public.crm_sync_log AS q
    WHERE q.record_type = 'lead'
      AND q.action = 'upsert_contact'
      AND q.attempts < q.max_attempts
      AND (
        (q.status = 'pending' AND (q.next_retry_at IS NULL OR q.next_retry_at <= clock_timestamp()))
        OR (q.status = 'failed' AND q.next_retry_at IS NOT NULL AND q.next_retry_at <= clock_timestamp())
        OR (q.status = 'in_progress' AND q.updated_at < clock_timestamp() - INTERVAL '15 minutes')
      )
    ORDER BY q.created_at, q.id
    LIMIT v_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.crm_sync_log AS q
  SET status = 'in_progress',
      attempts = CASE WHEN q.status = 'in_progress' THEN q.attempts ELSE q.attempts + 1 END,
      next_retry_at = NULL,
      updated_at = clock_timestamp()
  FROM candidates AS c
  WHERE q.id = c.id
  RETURNING q.*;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_hubspot_sync_jobs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_hubspot_sync_jobs(integer) TO service_role;
