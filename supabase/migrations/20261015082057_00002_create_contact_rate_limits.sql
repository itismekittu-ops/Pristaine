/*
# Create contact_rate_limits table for server-side rate limiting

1. Purpose
   The contact-submit Edge Function needs a durable, shared store for rate
   limiting. Per-instance memory is not reliable across Edge Function
   invocations. This table is the trusted shared store required by ARC-FRM
   section 9.2 and BR-75.

2. New Tables
   - contact_rate_limits: Stores a row per submission attempt with a
     truncated/hashed IP identifier and timestamp. The Edge Function checks
     the count of recent rows for the same identifier to enforce a rate limit.

3. Security
   - RLS enabled. No direct visitor access.
   - Only the service role (used by the Edge Function) can read and write.

4. Important Notes
   - IP addresses are stored only in shortened/truncated form (BR-75).
   - Old rows can be cleaned up by a scheduled job (not implemented in this
     batch). The table is lightweight and old rows do not affect correctness
     because queries are windowed by time.
*/

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_rate_limits_identifier_idx ON contact_rate_limits (identifier);
CREATE INDEX IF NOT EXISTS contact_rate_limits_created_at_idx ON contact_rate_limits (created_at);

ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON contact_rate_limits FROM anon, authenticated;
