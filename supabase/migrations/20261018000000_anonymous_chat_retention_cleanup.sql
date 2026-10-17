/*
# Anonymous chat retention cleanup (BR-74)

1. Purpose
   Automatically delete anonymous chatbot conversations that have had no
   activity for 90 days, per Business Rules BR-74 and OQ-06. Runs as a daily
   pg_cron job calling a trusted, database-side SECURITY DEFINER function.
   No Edge Function invocation, no secrets, and no HubSpot involvement:
   anonymous conversations are never synced to the CRM.

2. New Function
   - public.cleanup_expired_anonymous_chats(p_retention_days integer DEFAULT 90)
     Returns json with the number of deleted sessions and the execution
     timestamp (UTC). No personal data is returned or logged.

     A session is eligible only when ALL of the following hold:
       - is_anonymous is true (explicitly anonymous);
       - lead_id IS NULL (not linked to a lead);
       - last_activity_at IS NOT NULL and older than the retention window.
         A session with no usable activity timestamp is never deleted.

     chat_messages rows are removed by the existing ON DELETE CASCADE foreign
     key from chat_messages.session_id to chat_sessions.id inside the same
     DELETE statement, so a partially deleted conversation is impossible.

     Concurrency: candidates are locked FOR UPDATE SKIP LOCKED, and the DELETE
     re-checks every eligibility predicate on the locked rows. Read Committed
     re-evaluates the predicates against the latest row version when the lock
     is acquired, so a session that has just become active or has just been
     linked to a lead (e.g. by submit_chat_followup) is skipped. A LIMIT bounds
     each run; remaining eligible sessions are handled by later daily runs.

     Idempotent: repeated runs find no further eligible rows and delete 0.

3. Scheduling
   - cron.unschedule('chat_retention_cleanup_job') before cron.schedule(...)
     makes re-apply idempotent, matching the existing Calendly convention.
   - Runs daily at 04:17 UTC; deletion happens at the first scheduled run
     after the 90-day inactivity threshold is passed.
   - The job calls the database function directly (no HTTP, no secrets).

4. Security
   - EXECUTE granted to service_role only; revoked from PUBLIC, anon and
     authenticated. Neither anon nor authenticated can invoke the cleanup.
   - No other tables or integrations are touched: leads, form_submissions,
     bookings, crm_sync_log, approved_answers, privacy_requests and the
     HubSpot worker are unaffected.

5. Important Notes
   - THIS MIGRATION IS INCLUDED FOR REVIEW. DO NOT APPLY TO PRODUCTION OR
     ACTIVATE SCHEDULED DELETION UNTIL THE OWNER APPROVES.
*/

CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_chats(
  p_retention_days integer DEFAULT 90
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_deleted integer;
BEGIN
  WITH eligible AS (
    SELECT s.id
    FROM public.chat_sessions AS s
    WHERE s.is_anonymous
      AND s.lead_id IS NULL
      AND s.last_activity_at IS NOT NULL
      AND s.last_activity_at < clock_timestamp() - make_interval(days => p_retention_days)
    ORDER BY s.last_activity_at, s.id
    LIMIT 5000
    FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.chat_sessions AS s
  USING eligible AS e
  WHERE s.id = e.id
    AND s.is_anonymous
    AND s.lead_id IS NULL
    AND s.last_activity_at IS NOT NULL
    AND s.last_activity_at < clock_timestamp() - make_interval(days => p_retention_days);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN json_build_object(
    'deleted_sessions', v_deleted,
    'executed_at', to_char(clock_timestamp() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.cleanup_expired_anonymous_chats(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_anonymous_chats(integer)
  TO service_role;

SELECT cron.unschedule('chat_retention_cleanup_job');

SELECT cron.schedule(
  'chat_retention_cleanup_job',
  '17 4 * * *',
  $cmd$
  SELECT public.cleanup_expired_anonymous_chats(90);
  $cmd$
);
