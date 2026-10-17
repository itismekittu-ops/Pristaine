-- Run only AFTER:
-- 1) hubspot-sync has been deployed;
-- 2) HUBSPOT_SYNC_CRON_SECRET is set as an Edge Function secret;
-- 3) the same value is stored in Supabase Vault under the name hubspot_sync_cron_secret;
-- 4) a manual test run has succeeded and HUBSPOT_SYNC_ENABLED is intentionally true.
-- This schedule processes queued lead contacts every 5 minutes. It does not sync
-- booking objects or chat transcripts to HubSpot.

SELECT cron.unschedule('hubspot_sync_job')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'hubspot_sync_job'
);

SELECT cron.schedule(
  'hubspot_sync_job',
  '*/5 * * * *',
  $cmd$
  DO $inner$
  DECLARE
    v_secret text;
    v_function_url text;
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'hubspot_sync_cron_secret'
    LIMIT 1;

    IF v_secret IS NULL THEN
      RAISE NOTICE 'Vault secret hubspot_sync_cron_secret not found; skipping HubSpot sync';
      RETURN;
    END IF;

    v_function_url := 'https://ycqcuyhsohwyybioegkx.supabase.co/functions/v1/hubspot-sync';

    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Cron-Secret', v_secret
      ),
      body := jsonb_build_object('batch_size', 10)
    );
  END;
  $inner$
  $cmd$
);
