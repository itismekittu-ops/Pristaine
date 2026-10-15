/*
# Enable pg_cron and pg_net extensions

1. Purpose
   Enable the pg_cron and pg_net extensions required for scheduled
   HTTP invocation of the calendly-sync Edge Function.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
