-- TRANSACTION-BASED INTEGRATION TEST (BR-74) — synthetic records only.
--
-- Purpose: verify the actual cleanup function against synthetic chat sessions
-- inside one explicit transaction that ALWAYS rolls back. No production row
-- is modified, and no synthetic row survives the test.
--
-- HOW TO RUN SAFELY IN THE SUPABASE SQL EDITOR
--   1. Select the ENTIRE script, from BEGIN to ROLLBACK, and run it in one
--      execution so the editor cannot auto-commit between statements.
--   2. Read the result rows (schema check outcome, cleanup_result with the
--      deletion count, per-key pass/fail rows, aggregate checks), then
--      confirm the final statement executed was ROLLBACK.
--   3. LIMITATION: the Supabase SQL Editor runs statements through its own
--      runner, and some editor modes execute statements separately, which
--      would break the single-transaction guarantee. If reliable rollback in
--      the editor cannot be confirmed for your project, run the script with
--      psql against the project's direct database URL instead, where explicit
--      transaction control is fully reliable. Do not run the script partially.
--   4. SAFETY: the script only inserts rows tagged RETENTION_TEST_, touches
--      no cron configuration, and contains NO COMMIT statement. The final
--      ROLLBACK discards every insert, every deletion and the synthetic lead.
--      If any statement errors, Postgres aborts the whole transaction and the
--      ROLLBACK (or connection close) discards everything.

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Schema check: fail fast with a clear error if the expected schema is
--    missing (e.g. part 1 of the migration was not applied in this project).
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(col, ', ') INTO v_missing
  FROM (
    SELECT 'chat_sessions.last_activity_at' AS col
    UNION ALL SELECT 'chat_sessions.is_anonymous'
    UNION ALL SELECT 'chat_sessions.lead_id'
    UNION ALL SELECT 'chat_messages.session_id'
  ) required
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = split_part(col, '.', 1)
      AND column_name = split_part(col, '.', 2)
  );

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'schema check failed, missing: %', v_missing;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_expired_anonymous_chats'
  ) THEN
    RAISE EXCEPTION 'cleanup_expired_anonymous_chats not found; apply part 1 first';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. Synthetic records, uniquely tagged so they can never be confused with
--    production rows. All sessions carry one message so cascade deletion is
--    exercised.
-- ---------------------------------------------------------------------------

CREATE TEMP TABLE synthetic_setup ON COMMIT DROP AS
SELECT * FROM (VALUES
  -- (key, is_anonymous, has_lead, days_inactive, expect_deleted)
  ('expired_anonymous',     true,  false, 100, true ),
  ('recent_anonymous',      true,  false,   1, false),
  ('expired_lead_linked',   true,  true,  100, false),
  ('expired_non_anonymous', false, false, 100, false)
) AS t(key, is_anonymous, has_lead, days_inactive, expect_deleted);

DO $$
DECLARE
  r record;
  v_lead_id uuid;
  v_session_id uuid;
BEGIN
  -- One synthetic lead so the lead-linked case has a real FK target.
  INSERT INTO public.leads (name, email, email_normalized)
  VALUES ('RETENTION_TEST', 'retention-test@example.com', 'retention-test@example.com')
  RETURNING id INTO v_lead_id;

  FOR r IN SELECT * FROM synthetic_setup LOOP
    INSERT INTO public.chat_sessions (visitor_id, is_anonymous, lead_id, started_at, last_activity_at)
    VALUES (
      'RETENTION_TEST_' || r.key,
      r.is_anonymous,
      CASE WHEN r.has_lead THEN v_lead_id ELSE NULL END,
      clock_timestamp() - make_interval(days => r.days_inactive + 1),
      clock_timestamp() - make_interval(days => r.days_inactive)
    )
    RETURNING id INTO v_session_id;

    INSERT INTO public.chat_messages (session_id, role, content, answer_source)
    VALUES (v_session_id, 'visitor', 'RETENTION_TEST synthetic message', 'blocked');
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Run the real cleanup function.
-- ---------------------------------------------------------------------------

SELECT public.cleanup_expired_anonymous_chats(90) AS cleanup_result;

-- ---------------------------------------------------------------------------
-- 3. Verify. Exactly one synthetic session (expired_anonymous) and its
--    message must be gone; the other three sessions and their messages must
--    survive. The per-key check catches the wrong row being deleted; the
--    count in cleanup_result catches under- and over-deletion.
-- ---------------------------------------------------------------------------

WITH expected AS (
  SELECT key, expect_deleted FROM synthetic_setup
),
actual AS (
  SELECT visitor_id AS key
  FROM public.chat_sessions
  WHERE visitor_id LIKE 'RETENTION_TEST_%'
)
SELECT
  e.key,
  e.expect_deleted,
  (a.key IS NULL) AS actually_deleted,
  (e.expect_deleted = (a.key IS NULL)) AS pass
FROM expected e
LEFT JOIN actual a ON a.key = 'RETENTION_TEST_' || e.key
ORDER BY e.key;

-- Aggregate check: only the surviving sessions' messages remain (three), and
-- the synthetic lead is untouched by the cleanup.
SELECT
  (SELECT count(*) FROM public.chat_messages m
    JOIN public.chat_sessions s ON s.id = m.session_id
    WHERE s.visitor_id LIKE 'RETENTION_TEST_%') AS surviving_synthetic_messages,
  (SELECT count(*) FROM public.leads WHERE email_normalized = 'retention-test@example.com') AS synthetic_lead_preserved;

ROLLBACK;
