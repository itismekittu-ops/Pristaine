/*
# Create core database schema for Pristaine

1. Purpose
   Establish the full data model for Pristaine's contact-form pipeline,
   future chatbot, booking, CRM sync and privacy workflows. This migration
   creates all eight documented tables, enables row-level security on every
   private table, and provides a SECURITY DEFINER function that atomically
   saves a contact submission (lead upsert + form_submissions insert +
   crm_sync_log queue entry) in a single transaction.

2. New Tables
   - leads: One row per normalized email. Stores name, email, phone (optional),
     company (optional), source/campaign fields and HubSpot contact ID.
   - form_submissions: Append-only log of each contact form submission.
   - chat_sessions: Anonymous-by-default chat sessions.
   - chat_messages: Individual messages within a chat session.
   - bookings: Booking records filled by the Calendly webhook.
   - crm_sync_log: Queue table for HubSpot synchronization. No personal data.
   - privacy_requests: Privacy request tracking. No personal details once completed.
   - approved_answers: Approved answer library built from content files.

3. Security
   - RLS enabled on ALL tables. No direct visitor access.
   - SECURITY DEFINER function submit_contact for atomic contact submission.

4. Important Notes
   - submit_contact handles lead upsert (preserving existing optional fields),
     form_submissions insert, and crm_sync_log queue insertion atomically.
   - Already applied via mcp__supabase__apply_migration.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  email_normalized text NOT NULL,
  phone text,
  company text,
  source text,
  campaign text,
  hubspot_contact_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_normalized_uniq ON leads (email_normalized);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  message text NOT NULL,
  consent_line_version text NOT NULL,
  source_page text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS form_submissions_lead_id_idx ON form_submissions (lead_id);
CREATE INDEX IF NOT EXISTS form_submissions_submitted_at_idx ON form_submissions (submitted_at DESC);
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  page text,
  source text,
  campaign text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  summary text,
  topic_tags text[],
  is_anonymous boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS chat_sessions_visitor_id_idx ON chat_sessions (visitor_id);
CREATE INDEX IF NOT EXISTS chat_sessions_lead_id_idx ON chat_sessions (lead_id);
CREATE INDEX IF NOT EXISTS chat_sessions_last_activity_idx ON chat_sessions (last_activity_at DESC);
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('visitor', 'assistant', 'system')),
  content text NOT NULL,
  answer_source text CHECK (answer_source IN ('approved', 'ai_model', 'fallback', 'blocked')),
  library_entry_id text,
  instruction_version text,
  model_name text,
  response_time_ms integer,
  safety_flags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages (created_at);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  calendly_event_id text,
  start_time timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_lead_id_idx ON bookings (lead_id);
CREATE INDEX IF NOT EXISTS bookings_calendly_event_id_idx ON bookings (calendly_event_id);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS crm_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type text NOT NULL CHECK (record_type IN ('lead', 'chat_summary', 'booking')),
  record_id uuid NOT NULL,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'succeeded', 'failed', 'exhausted')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_retry_at timestamptz,
  hubspot_id text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_sync_log_status_idx ON crm_sync_log (status);
CREATE INDEX IF NOT EXISTS crm_sync_log_next_retry_at_idx ON crm_sync_log (next_retry_at);
CREATE INDEX IF NOT EXISTS crm_sync_log_record_type_id_idx ON crm_sync_log (record_type, record_id);
ALTER TABLE crm_sync_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('access', 'deletion', 'correction')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'verified', 'in_progress', 'completed', 'rejected')),
  received_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz,
  completed_at timestamptz,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS privacy_requests_status_idx ON privacy_requests (status);
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS approved_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  question_variants text[] NOT NULL DEFAULT '{}',
  answer text NOT NULL,
  version text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS approved_answers_status_idx ON approved_answers (status);
CREATE INDEX IF NOT EXISTS approved_answers_topic_idx ON approved_answers (topic);
ALTER TABLE approved_answers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION submit_contact(
  p_name text, p_email text, p_message text,
  p_company text DEFAULT NULL, p_phone text DEFAULT NULL,
  p_source_page text DEFAULT NULL, p_source text DEFAULT NULL,
  p_campaign text DEFAULT NULL, p_consent_line_version text DEFAULT NULL
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_normalized_email text; v_lead_id uuid; v_submission_id uuid; v_sync_id uuid;
BEGIN
  v_normalized_email := lower(trim(p_email));
  INSERT INTO leads (name, email, email_normalized, phone, company, source, campaign)
  VALUES (p_name, lower(trim(p_email)), v_normalized_email, nullif(trim(p_phone), ''), nullif(trim(p_company), ''), p_source, p_campaign)
  ON CONFLICT (email_normalized) DO UPDATE SET
    name = EXCLUDED.name,
    phone = COALESCE(nullif(trim(p_phone), ''), leads.phone),
    company = COALESCE(nullif(trim(p_company), ''), leads.company),
    source = COALESCE(p_source, leads.source),
    campaign = COALESCE(p_campaign, leads.campaign),
    updated_at = now()
  RETURNING id INTO v_lead_id;
  INSERT INTO form_submissions (lead_id, message, consent_line_version, source_page)
  VALUES (v_lead_id, p_message, COALESCE(p_consent_line_version, 'v1'), COALESCE(p_source_page, '/'))
  RETURNING id INTO v_submission_id;
  INSERT INTO crm_sync_log (record_type, record_id, action, status, next_retry_at)
  VALUES ('lead', v_lead_id, 'upsert_contact', 'pending', now())
  RETURNING id INTO v_sync_id;
  RETURN json_build_object('lead_id', v_lead_id, 'submission_id', v_submission_id, 'sync_queued', true);
END; $$;
GRANT EXECUTE ON FUNCTION submit_contact TO anon, authenticated;
REVOKE ALL ON leads FROM anon, authenticated;
REVOKE ALL ON form_submissions FROM anon, authenticated;
REVOKE ALL ON chat_sessions FROM anon, authenticated;
REVOKE ALL ON chat_messages FROM anon, authenticated;
REVOKE ALL ON bookings FROM anon, authenticated;
REVOKE ALL ON crm_sync_log FROM anon, authenticated;
REVOKE ALL ON privacy_requests FROM anon, authenticated;
REVOKE ALL ON approved_answers FROM anon, authenticated;
