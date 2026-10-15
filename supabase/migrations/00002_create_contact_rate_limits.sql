/*
# Create contact_rate_limits table for server-side rate limiting

1. Purpose
   Durable, shared store for rate limiting contact submissions. Already
   applied via mcp__supabase__apply_migration.

2. New Tables
   - contact_rate_limits: truncated/hashed IP identifier + timestamp.

3. Security
   - RLS enabled, no direct visitor access.
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
