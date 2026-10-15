/*
# Restrict submit_contact execution and add atomic rate-limit function

1. Purpose
   Close two security gaps:
   (a) submit_contact was callable by anon/authenticated directly via RPC.
   (b) Rate limiting was non-atomic and failed-open on DB errors.

2. Changes
   - REVOKE EXECUTE on submit_contact from PUBLIC, anon, authenticated.
   - GRANT EXECUTE on submit_contact to service_role.
   - Create check_and_record_rate_limit: atomic count + insert in one transaction.
   - Callable only by service_role.

3. Security
   - Only service_role and postgres can execute either function.
   - No RLS policies changed. No direct table access granted.
*/

REVOKE EXECUTE ON FUNCTION submit_contact FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION submit_contact FROM anon;
REVOKE EXECUTE ON FUNCTION submit_contact FROM authenticated;
GRANT EXECUTE ON FUNCTION submit_contact TO service_role;

CREATE OR REPLACE FUNCTION check_and_record_rate_limit(
  p_identifier text, p_max_attempts integer DEFAULT 3, p_window_minutes integer DEFAULT 10
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer; v_allowed boolean;
BEGIN
  SELECT count(*) INTO v_count
  FROM contact_rate_limits
  WHERE identifier = p_identifier
    AND created_at >= now() - (p_window_minutes || ' minutes')::interval;
  v_allowed := v_count < p_max_attempts;
  IF v_allowed THEN
    INSERT INTO contact_rate_limits (identifier) VALUES (p_identifier);
  END IF;
  RETURN json_build_object('allowed', v_allowed, 'count', v_count);
END; $$;
GRANT EXECUTE ON FUNCTION check_and_record_rate_limit TO service_role;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM anon;
REVOKE EXECUTE ON FUNCTION check_and_record_rate_limit FROM authenticated;
