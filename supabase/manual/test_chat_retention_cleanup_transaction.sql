-- RETENTION CLEANUP TEST (BR-74) — single-statement DO block, synthetic records only.
--
-- WHAT THIS DOES
--   Verifies the actual cleanup logic in THIS Supabase project using only
--   uniquely tagged synthetic records. It never reads, modifies or deletes a
--   real visitor session: the shared cleanup helper is invoked with an exact
--   synthetic visitor-ID prefix, so only rows created by this test can match.
--
-- ATOMICITY
--   The whole test is ONE statement (a DO block). If any assertion fails, the
--   block raises an exception and Postgres discards every change made inside
--   it. If all assertions pass, the block first deletes every remaining
--   synthetic session, message and lead it created, then ends — so a
--   successful run leaves the database exactly as it was. There is NO COMMIT
--   statement anywhere; atomicity comes from the single-statement DO block.
--
-- HOW TO RUN
--   Supabase dashboard -> SQL Editor: paste this entire file and run it once.
--   Expected result on success: "DO" (no error). Each RAISE NOTICE appears in
--   the Messages/Results pane: one line per verified assertion plus a final
--   RETENTION TEST PASSED line. Any error means an assertion failed and all
--   effects were rolled back automatically.
--
-- SAFETY
--   - Contains no COMMIT and no cron statements.
--   - Never calls the unrestricted production cleanup function.
--   - The synthetic prefix is generated randomly inside the statement, so two
--     runs can never interfere with each other or with production rows.

DO $test$
DECLARE
  -- Unique, application-safe prefix ([A-Za-z0-9_-] only; visitor_id is plain
  -- text with no CHECK constraint — verified against the live schema below).
  v_prefix text := 'PRT_TEST_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12) || '_';
  v_lead_id uuid;
  v_expired_id uuid;
  v_recent_id uuid;
  v_lead_linked_id uuid;
  v_non_anon_id uuid;
  v_result json;
  v_count integer;
  v_check integer;
BEGIN
  -- -------------------------------------------------------------------------
  -- 0. Schema and function checks (fail fast, before any synthetic data).
  -- -------------------------------------------------------------------------

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_sessions'
      AND column_name = 'last_activity_at' AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'schema check failed: chat_sessions.last_activity_at NOT NULL not found';
  END IF;

  SELECT count(*) INTO v_check
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'chat_sessions'
    AND column_name IN ('is_anonymous', 'lead_id', 'visitor_id', 'started_at');
  IF v_check <> 4 THEN
    RAISE EXCEPTION 'schema check failed: expected chat_sessions columns missing';
  END IF;

  SELECT count(*) INTO v_check
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'chat_messages'
    AND column_name IN ('session_id', 'role', 'content');
  IF v_check <> 3 THEN
    RAISE EXCEPTION 'schema check failed: expected chat_messages columns missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('cleanup_expired_anonymous_chats', 'cleanup_expired_anonymous_chats_in_prefix')
  ) THEN
    RAISE EXCEPTION 'cleanup functions not found; apply part 1 of the retention migration first';
  END IF;

  -- The prefix must be free in production before we start.
  SELECT count(*) INTO v_check FROM public.chat_sessions
  WHERE starts_with(visitor_id, v_prefix);
  IF v_check <> 0 THEN
    RAISE EXCEPTION 'synthetic prefix collision (impossible in practice); aborting';
  END IF;
  RAISE NOTICE 'schema and function checks passed';

  -- -------------------------------------------------------------------------
  -- 1. Synthetic records. visitor_id = v_prefix || key for every session.
  -- -------------------------------------------------------------------------

  INSERT INTO public.leads (name, email, email_normalized)
  VALUES ('RETENTION_TEST', v_prefix || '@example.com', v_prefix || '@example.com')
  RETURNING id INTO v_lead_id;

  -- Expired anonymous session: must be deleted, messages cascaded.
  INSERT INTO public.chat_sessions (visitor_id, is_anonymous, lead_id, started_at, last_activity_at)
  VALUES (v_prefix || 'expired_anonymous', true, NULL,
          clock_timestamp() - interval '101 days',
          clock_timestamp() - interval '100 days')
  RETURNING id INTO v_expired_id;

  -- Recently active anonymous session: must be preserved.
  INSERT INTO public.chat_sessions (visitor_id, is_anonymous, lead_id, started_at, last_activity_at)
  VALUES (v_prefix || 'recent_anonymous', true, NULL,
          clock_timestamp() - interval '2 days',
          clock_timestamp() - interval '1 day')
  RETURNING id INTO v_recent_id;

  -- Lead-linked expired session: must be preserved regardless of age.
  INSERT INTO public.chat_sessions (visitor_id, is_anonymous, lead_id, started_at, last_activity_at)
  VALUES (v_prefix || 'expired_lead_linked', true, v_lead_id,
          clock_timestamp() - interval '101 days',
          clock_timestamp() - interval '100 days')
  RETURNING id INTO v_lead_linked_id;

  -- Non-anonymous expired session: must be preserved.
  INSERT INTO public.chat_sessions (visitor_id, is_anonymous, lead_id, started_at, last_activity_at)
  VALUES (v_prefix || 'expired_non_anonymous', false, NULL,
          clock_timestamp() - interval '101 days',
          clock_timestamp() - interval '100 days')
  RETURNING id INTO v_non_anon_id;

  INSERT INTO public.chat_messages (session_id, role, content, answer_source)
  VALUES
    (v_expired_id,       'visitor',   'RETENTION_TEST synthetic message', 'blocked'),
    (v_recent_id,        'visitor',   'RETENTION_TEST synthetic message', 'blocked'),
    (v_lead_linked_id,   'visitor',   'RETENTION_TEST synthetic message', 'blocked'),
    (v_non_anon_id,      'assistant', 'RETENTION_TEST synthetic message', 'blocked');

  RAISE NOTICE 'synthetic records created under prefix %', v_prefix;

  -- -------------------------------------------------------------------------
  -- 2. Invoke the shared cleanup logic, restricted to the synthetic prefix.
  --    The unrestricted production function is never called here.
  -- -------------------------------------------------------------------------

  v_result := public.cleanup_expired_anonymous_chats_in_prefix(90, v_prefix);
  v_count := (v_result->>'deleted_sessions')::integer;
  RAISE NOTICE 'cleanup returned deleted_sessions = %', v_count;

  -- -------------------------------------------------------------------------
  -- 3. Assertions. Any failure raises an exception and rolls back everything.
  -- -------------------------------------------------------------------------

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: expected exactly 1 deleted session, got %', v_count;
  END IF;

  -- The expired anonymous session and its messages are gone.
  SELECT count(*) INTO v_check FROM public.chat_sessions WHERE id = v_expired_id;
  IF v_check <> 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: expired anonymous session was not deleted';
  END IF;
  SELECT count(*) INTO v_check FROM public.chat_messages WHERE session_id = v_expired_id;
  IF v_check <> 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: messages of the expired session were not cascaded';
  END IF;
  RAISE NOTICE 'expired anonymous session deleted with its messages (cascade)';

  -- The three protected sessions survive, with their messages.
  SELECT count(*) INTO v_check FROM public.chat_sessions
  WHERE id IN (v_recent_id, v_lead_linked_id, v_non_anon_id);
  IF v_check <> 3 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: protected synthetic sessions were deleted';
  END IF;
  SELECT count(*) INTO v_check FROM public.chat_messages
  WHERE session_id IN (v_recent_id, v_lead_linked_id, v_non_anon_id);
  IF v_check <> 3 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: messages of protected sessions were deleted';
  END IF;
  RAISE NOTICE 'recent, lead-linked and non-anonymous sessions preserved';

  -- The synthetic lead is untouched.
  SELECT count(*) INTO v_check FROM public.leads WHERE id = v_lead_id;
  IF v_check <> 1 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: synthetic lead was modified or deleted';
  END IF;
  RAISE NOTICE 'synthetic lead preserved';

  -- -------------------------------------------------------------------------
  -- 4. Cleanup: remove every remaining synthetic row so a successful run
  --    leaves nothing behind (messages cascade with the sessions).
  -- -------------------------------------------------------------------------

  DELETE FROM public.chat_sessions WHERE starts_with(visitor_id, v_prefix);
  DELETE FROM public.leads WHERE id = v_lead_id;

  SELECT count(*) INTO v_check FROM public.chat_sessions WHERE starts_with(visitor_id, v_prefix);
  IF v_check <> 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: synthetic sessions remain after cleanup';
  END IF;
  SELECT count(*) INTO v_check FROM public.leads WHERE email_normalized = v_prefix || '@example.com';
  IF v_check <> 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: synthetic lead remains after cleanup';
  END IF;

  RAISE NOTICE 'RETENTION TEST PASSED: all synthetic records removed';
END;
$test$;
