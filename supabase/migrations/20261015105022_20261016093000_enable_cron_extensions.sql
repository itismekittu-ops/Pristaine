/*
# Enable pg_cron and pg_net extensions

1. Purpose
   Enable the pg_cron and pg_net extensions required for scheduled
   HTTP invocation of the calendly-sync Edge Function.

2. What these extensions provide
   - pg_cron: a cron-based job scheduler for PostgreSQL. Creates the
     'cron' schema and role.
   - pg_net: provides net.http_post and similar functions for making
     HTTP requests from SQL.

3. Important Notes
   - These extensions are available on Supabase but must be explicitly
     enabled before they can be used.
   - The cron schedule itself is created in a follow-up migration.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
