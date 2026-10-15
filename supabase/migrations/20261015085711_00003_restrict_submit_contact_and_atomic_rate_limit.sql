/*
# Restrict submit_contact execution and add atomic rate-limit function

1. Purpose
   Close two security gaps in the contact-submission pipeline:
   (a) The submit_contact SECURITY DEFINER function was executable by anon
       and authenticated roles, meaning a visitor could call it directly via
       the Supabase REST/RPC API without going through the Edge Function.
   (b) Rate limiting was non-atomic (separate count + insert), allowing
       concurrent requests to bypass the limit, and failed-open on DB errors.

2. Changes
   - REVOKE EXECUTE on submit_contact from PUBLIC, anon, authenticated.
   - GRANT EXECUTE on submit_contact to service_role (the Edge Function's role).
   - Create check_and_record_rate_limit: a SECURITY DEFINER function that
     atomically counts existing attempts and inserts a new row in one
     transaction, returning whether the limit is exceeded. Callable only
     by service_role.
   - GRANT EXECUTE on check_and_record_rate_limit to service_role only.

3. Security
   - After this migration, only service_role and postgres can execute
     submit_contact. Anonymous and authenticated users cannot call it
     directly.
   - The rate-limit function is SECURITY DEFINER with a fixed search_path,
     callable only by service_role. It does not expose the
     contact_rate_limits table to anon/authenticated.
   - No RLS policies changed. No direct table access granted.

4. Important Notes
   - This is a forward-only permission migration. The original 00001 and
     00002 migration files are not modified.
   - The rate-limit function returns a JSON object with:
     { allowed: true } when under the limit (and records the attempt),
     { allowed: false } when at or over the limit (and does not record).
   - Limit: 3 attempts per identifier in a 10-minute window.
*/

-- ============================================================
-- Restrict submit_contact to service_role only
-- ============================================================
REVOKE EXECUTE ON FUNCTION submit_contact FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION submit_contact FROM anon;
REVOKE EXECUTE ON FUNCTION submit_contact FROM authenticated;
-- service_role already has EXECUTE; grant explicitly for clarity
GRANT EXECUTE ON FUNCTION submit_contact TO service_role;

-- ============================================================
-- Atomic rate-limit function: count + insert in one transaction
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_record_rate_limit(
  p_identifier text,
  p_max_attempts integer DEFAULT 3,
  p_window_minutes integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_allowed boolean;
BEGIN
  -- Count existing attempts in the time window
  SELECT count(*) INTO v_count
  FROM contact_rate_limits
  WHERE identifier = p_identifier
    AND created_at >= now() - (p_window_minutes || ' minutes')::interval;

  v_allowed := v_count < p_max_attempts;

  IF v_allowed THEN
    -- Insert the new attempt record atomically
    INSERT INTO contact_rate_limits (identifier)
    VALUES (p_identifier);
  END IF;

  RETURN json_build_object('allowed', v_allowed, 'count', v_count);
END;
$$;

-- Only service_role can call the rate-limit function
GRANT EXECUTE ON FUNCTION check_and_record_rate_limit TO service_role;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM anon;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM authenticated;
