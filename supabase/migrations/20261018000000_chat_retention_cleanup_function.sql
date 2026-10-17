/*
# Anonymous chat retention cleanup function (BR-74) — part 1 of 2

1. Purpose
   Creates the trusted, database-side cleanup function that deletes anonymous
   chatbot conversations after 90 days of inactivity, per Business Rules
   BR-74 and OQ-06. This migration only defines the function and its
   permissions. It does NOT create, modify or activate any scheduled job.
   The daily scheduling configuration is a separate migration
   (20261018000001_schedule_chat_retention_cleanup.sql) that will be reviewed
   and, only with owner approval, applied separately.

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

3. Security
   - EXECUTE granted to service_role only; revoked from PUBLIC, anon and
     authenticated. Neither anon nor authenticated can invoke the cleanup.
   - No other tables or integrations are touched: leads, form_submissions,
     bookings, crm_sync_log, approved_answers, privacy_requests and the
     HubSpot worker are unaffected.
   - This migration contains no cron.schedule or cron.unschedule statements.

4. Important Notes
   - THIS MIGRATION IS INCLUDED FOR REVIEW. DO NOT APPLY TO PRODUCTION UNTIL
     THE OWNER APPROVES.
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
