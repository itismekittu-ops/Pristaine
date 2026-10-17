-- REVIEW-ONLY, READ-ONLY query (BR-74).
-- Counts chat sessions that the retention cleanup would delete, WITHOUT
-- exposing visitor IDs, message contents, emails or any other personal data.
-- It never writes anything and can be run safely in the Supabase SQL Editor.
--
-- Eligibility mirrors public.cleanup_expired_anonymous_chats exactly:
--   is_anonymous AND lead_id IS NULL AND last_activity_at IS NOT NULL
--   AND last_activity_at < now - 90 days
--
-- The final SELECT returns only aggregate counts. Although session IDs are
-- needed internally for the breakdown, they are never returned; the oldest
-- eligible activity timestamp is returned only as an interval, not a date
-- tied to any identifiable record.

WITH eligible AS (
  SELECT
    s.id,
    s.last_activity_at,
    EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.session_id = s.id) AS has_messages
  FROM public.chat_sessions s
  WHERE s.is_anonymous
    AND s.lead_id IS NULL
    AND s.last_activity_at IS NOT NULL
    AND s.last_activity_at < clock_timestamp() - make_interval(days => 90)
)
SELECT
  count(*) AS eligible_sessions,
  count(*) FILTER (WHERE has_messages) AS eligible_sessions_with_messages,
  count(*) FILTER (WHERE NOT has_messages) AS eligible_sessions_without_messages,
  max(now() - last_activity_at) AS oldest_inactivity_interval
FROM eligible;
