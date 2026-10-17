-- Chat email follow-up (F2-US8):
-- 1. Allow a legitimate email-only lead (no fabricated name). The contact form
--    still requires a name at the Edge Function layer.
-- 2. Record the follow-up consent version and timestamp on the chat session.
-- 3. Add a SECURITY DEFINER function that atomically: upserts the lead by
--    normalized email (preserving existing name/phone/company when the
--    visitor submits only an email), links the lead to the visitor's latest
--    chat session, marks the session non-anonymous, records consent, and
--    queues the existing HubSpot upsert_contact job. Returns whether the
--    conversation link succeeded so the caller can report honest status.

ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;

ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS followup_consent_version text,
  ADD COLUMN IF NOT EXISTS followup_consent_at timestamptz;

CREATE OR REPLACE FUNCTION submit_chat_followup(
  p_email text,
  p_visitor_id text,
  p_source_page text DEFAULT NULL,
  p_consent_line_version text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_email text;
  v_lead_id uuid;
  v_session_id uuid;
  v_updated_rows integer;
BEGIN
  v_normalized_email := lower(trim(p_email));

  -- Upsert lead by normalized email. Existing name, phone and company are
  -- never overwritten by empty values; email-only submissions leave them as-is.
  INSERT INTO leads (name, email, email_normalized)
  VALUES (NULL, v_normalized_email, v_normalized_email)
  ON CONFLICT (email_normalized)
  DO UPDATE SET updated_at = now()
  RETURNING id INTO v_lead_id;

  -- Link to this visitor's most recent chat session. The link is required:
  -- a follow-up that cannot be attached to a conversation fails the whole
  -- operation (no partial lead).
  UPDATE chat_sessions
  SET lead_id = v_lead_id,
      is_anonymous = false,
      followup_consent_version = COALESCE(p_consent_line_version, 'v1'),
      followup_consent_at = now()
  WHERE id = (
    SELECT id FROM chat_sessions
    WHERE visitor_id = p_visitor_id
    ORDER BY last_activity_at DESC, id DESC
    LIMIT 1
    FOR UPDATE
  );
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  IF v_updated_rows = 0 THEN
    RAISE EXCEPTION 'no_matching_chat_session' USING ERRCODE = 'P0002';
  END IF;

  SELECT id INTO v_session_id FROM chat_sessions
  WHERE visitor_id = p_visitor_id
  ORDER BY last_activity_at DESC, id DESC
  LIMIT 1;

  -- Queue the existing HubSpot sync job (duplicate-safe upsert stays in the worker).
  INSERT INTO crm_sync_log (record_type, record_id, action, status, next_retry_at)
  VALUES ('lead', v_lead_id, 'upsert_contact', 'pending', now());

  RETURN json_build_object(
    'lead_id', v_lead_id,
    'chat_session_id', v_session_id,
    'conversation_linked', true,
    'sync_queued', true
  );
END;
$$;

REVOKE ALL ON FUNCTION submit_chat_followup(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_chat_followup(text, text, text, text) TO anon, authenticated;
