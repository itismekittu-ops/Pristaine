/*
# Create Calendly sync cron schedule

1. Purpose
   Create a scheduled job that invokes the calendly-sync Edge Function
   every 15 minutes to poll for new and updated Calendly bookings.

2. Security
   - The cron secret is read from Supabase Vault at execution time via
     the vault.decrypted_secrets view, NOT embedded in the SQL.
   - No secrets appear in job definitions, SQL, or logs.

4. Prerequisites (must be done before the schedule is active)
   - Store the cron secret in Vault:
       SELECT vault.create_secret('your-high-entropy-secret', 'calendly_sync_cron_secret');
   - Set CALENDLY_SYNC_CRON_SECRET in Supabase Edge Function secrets to
     the SAME value.
   - Set CALENDLY_API_TOKEN in Supabase Edge Function secrets.
   - Deploy the calendly-sync Edge Function.
*/

SELECT cron.unschedule('calendly_sync_job');

SELECT cron.schedule(
  'calendly_sync_job',
  '*/15 * * * *',
  $cmd$
  DO $inner$
  DECLARE
    v_secret text;
    v_function_url text;
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'calendly_sync_cron_secret'
    LIMIT 1;

    IF v_secret IS NULL THEN
      RAISE NOTICE 'Vault secret calendly_sync_cron_secret not found, skipping sync';
      RETURN;
    END IF;

    v_function_url := 'https://ycqcuyhsohwyybioegkx.supabase.co/functions/v1/calendly-sync';

    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Cron-Secret', v_secret
      ),
      body := '{}'::jsonb
    );
  END;
  $inner$;
  $cmd$
);
