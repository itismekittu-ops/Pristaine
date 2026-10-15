/*
# Add booking sync columns and unique constraint

1. Purpose
   Extend the existing bookings table with an end_time column and a unique
   constraint on calendly_event_id so the Calendly sync function can
   idempotently upsert booking records. Add a sync_runs table to track
   synchronization checkpoints and prevent a failed run from advancing
   the successful-sync marker.

2. Changes to existing tables
   - bookings: add end_time timestamptz (nullable)
   - bookings: add unique index on calendly_event_id for idempotency

3. New Tables
   - sync_runs: Tracks each Calendly sync invocation with status, counts,
     timestamps, and error information. No personal data.

4. Security
   - RLS enabled on sync_runs. No visitor access (private table).
*/

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_calendly_event_id_uniq
  ON bookings (calendly_event_id)
  WHERE calendly_event_id IS NOT NULL;

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
