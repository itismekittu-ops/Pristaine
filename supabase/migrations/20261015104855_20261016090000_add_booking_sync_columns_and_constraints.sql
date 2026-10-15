/*
# Add booking sync columns and unique constraint

1. Purpose
   Extend the existing bookings table with an end_time column and a unique
   constraint on calendly_event_id so the Calendly sync function can
   idempotently upsert booking records. Add a sync_runs table to track
   synchronization checkpoints and prevent a failed run from advancing
   the successful-sync marker.

2. Changes to existing tables
   - bookings: add `end_time timestamptz` (nullable, for canceled events
     that may not have end times from the API).
   - bookings: add unique index on `calendly_event_id` to enforce
     idempotency. Existing data was checked: 0 rows, 0 duplicates, so the
     unique index is safe.

3. New Tables
   - sync_runs: Tracks each Calendly sync invocation with status, counts,
     timestamps, and error information. No personal data is stored here —
     only aggregate counts and error codes.

4. Security
   - RLS enabled on sync_runs. No visitor access (private table).
   - All private tables remain locked down — no new grants to anon or
     authenticated roles.

5. Important Notes
   - The unique index on calendly_event_id allows NULL values (Postgres
     treats each NULL as distinct), so legacy rows without a calendly_event_id
     are not affected.
   - The sync_runs table stores only non-sensitive metadata: run status,
     event counts, error codes, timestamps. No personal data, invitee
     payloads, or API tokens.
*/

-- Add end_time column to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time timestamptz;

-- Add unique index on calendly_event_id for idempotent upserts
-- (NULLs are allowed and treated as distinct by default, so existing
-- rows without a calendly_event_id are unaffected)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_calendly_event_id_uniq
  ON bookings (calendly_event_id)
  WHERE calendly_event_id IS NOT NULL;

-- Create sync_runs table for tracking sync checkpoints
CREATE TABLE IF NOT EXISTS sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'calendly',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'partial_success', 'failed')),
  active_created integer NOT NULL DEFAULT 0,
  active_updated integer NOT NULL DEFAULT 0,
  cancelled_updated integer NOT NULL DEFAULT 0,
  leads_created integer NOT NULL DEFAULT 0,
  leads_linked integer NOT NULL DEFAULT 0,
  crm_queued integer NOT NULL DEFAULT 0,
  errors integer NOT NULL DEFAULT 0,
  error_code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS sync_runs_started_at_idx ON sync_runs (started_at DESC);
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON sync_runs FROM anon, authenticated;
