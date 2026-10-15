-- Serialize rate-limit decisions for each identifier.
-- This migration is forward-only and does not delete existing data.

CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_identifier text,
  p_max_attempts integer DEFAULT 3,
  p_window_minutes integer DEFAULT 10
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_count integer;
  v_allowed boolean;
  v_now timestamptz;
BEGIN
  IF p_identifier IS NULL
     OR pg_catalog.btrim(p_identifier) = '' THEN
    RAISE EXCEPTION 'Invalid rate-limit identifier'
      USING ERRCODE = '22023';
  END IF;

  IF p_max_attempts IS NULL
     OR p_max_attempts < 1
     OR p_window_minutes IS NULL
     OR p_window_minutes < 1 THEN
    RAISE EXCEPTION 'Invalid rate-limit configuration'
      USING ERRCODE = '22023';
  END IF;

  -- Requests for the same identifier wait for one another.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_identifier, 0)
  );

  v_now := pg_catalog.clock_timestamp();

  SELECT pg_catalog.count(*)::integer
  INTO v_count
  FROM public.contact_rate_limits
  WHERE identifier = p_identifier
    AND created_at >=
      v_now - pg_catalog.make_interval(mins => p_window_minutes);

  v_allowed := v_count < p_max_attempts;

  IF v_allowed THEN
    INSERT INTO public.contact_rate_limits (
      identifier,
      created_at
    )
    VALUES (
      p_identifier,
      v_now
    );
  END IF;

  RETURN pg_catalog.json_build_object(
    'allowed', v_allowed,
    'count', v_count + CASE WHEN v_allowed THEN 1 ELSE 0 END
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION
  public.check_and_record_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.check_and_record_rate_limit(text, integer, integer)
  TO service_role;