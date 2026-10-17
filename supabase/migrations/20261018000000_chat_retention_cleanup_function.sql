/*
# Anonymous chat retention cleanup functions (BR-74) — part 1 of 2

1. Purpose
   Creates the trusted, database-side cleanup logic that deletes anonymous
   chatbot conversations after 90 days of inactivity, per Business Rules
   BR-74 and OQ-06. Two functions are defined:

   - public.cleanup_expired_anonymous_chats(p_retention_days integer DEFAULT 90)
     The PRODUCTION entry point. Delegates to the helper below WITHOUT a
     prefix filter, so it considers every eligible anonymous session. The
     daily schedule (part 2) calls this function only.

   - public.cleanup_expired_anonymous_chats_in_prefix(
         p_retention_days integer DEFAULT 90,
         p_visitor_id_prefix text DEFAULT NULL)
     INTERNAL helper with an optional exact visitor-ID prefix filter. When
     the prefix is NULL or empty there is no restriction (production path).
     When a prefix is supplied, only sessions whose visitor_id starts with
     that exact prefix are eligible — used exclusively by the review test to
     bound every check and deletion to uniquely tagged synthetic records.
     The comparison uses starts_with()/exact prefix equality, never a LIKE
     pattern, so no character in the prefix can act as a wildcard.

     chat_sessions.visitor_id is a plain NOT NULL text column with no CHECK
     constraint; the application-level pattern ([A-Za-z0-9_-]+) is enforced in
     the chat Edge Function. The test prefix uses only those safe characters.

2. Eligibility (identical in candidate selection and deletion re-check)
   A session is deleted only when ALL of the following hold:
     - is_anonymous is true (explicitly anonymous);
     - lead_id IS NULL (not linked to a lead);
     - last_activity_at IS NOT NULL and older than the retention window
       (a session with no usable activity timestamp is never deleted);
     - when a prefix filter is supplied: visitor_id starts with that prefix.

3. Deletion mechanics
   chat_messages rows are removed by the existing ON DELETE CASCADE foreign
   key from chat_messages.session_id to chat_sessions.id inside the same
   DELETE statement, so a partially deleted conversation is impossible.
   Concurrency: candidates are locked FOR UPDATE SKIP LOCKED, and the DELETE
   re-checks every predicate on the locked rows; under Read Committed a
   session that has just become active or been linked to a lead fails the
   re-check and is skipped. A LIMIT bounds each run. Repeated runs delete 0.

4. Return value
   Both functions return json with deleted_sessions (count) and executed_at
   (UTC timestamp). No personal data is returned or logged.

5. Security
   - Both functions are SECURITY DEFINER with a pinned search_path.
   - EXECUTE on BOTH is revoked from PUBLIC, anon and authenticated and
     granted to service_role only. Browser roles can never invoke either
     function. (The Supabase SQL Editor runs as the postgres superuser, which
     is expected for the owner-run review test.)
   - This migration contains no cron statements. The daily scheduling
     configuration is a separate migration
     (20261018000001_schedule_chat_retention_cleanup.sql) that must not be
     applied until the owner approves activating scheduled deletion.

6. Important Notes
   - THIS MIGRATION IS INCLUDED FOR REVIEW. DO NOT APPLY TO PRODUCTION UNTIL
     THE OWNER APPROVES.
*/

CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_chats_in_prefix(
  p_retention_days integer DEFAULT 90,
  p_visitor_id_prefix text DEFAULT NULL
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
    WHERE (p_visitor_id_prefix IS NULL
           OR p_visitor_id_prefix = ''
           OR starts_with(s.visitor_id, p_visitor_id_prefix))
      AND s.is_anonymous
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
    AND (p_visitor_id_prefix IS NULL
         OR p_visitor_id_prefix = ''
         OR starts_with(s.visitor_id, p_visitor_id_prefix))
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_chats(
  p_retention_days integer DEFAULT 90
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Production path: no prefix filter, all eligible sessions considered.
  RETURN public.cleanup_expired_anonymous_chats_in_prefix(p_retention_days, NULL);
END;
$function$;

REVOKE ALL ON FUNCTION public.cleanup_expired_anonymous_chats(integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_expired_anonymous_chats_in_prefix(integer, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_anonymous_chats(integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_anonymous_chats_in_prefix(integer, text)
  TO service_role;
