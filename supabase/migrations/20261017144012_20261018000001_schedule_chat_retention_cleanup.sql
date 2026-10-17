/*
# Anonymous chat retention cleanup schedule (BR-74) — part 2 of 2

1. Purpose
   Registers the daily pg_cron job that runs the anonymous chat retention
   cleanup function, per Business Rules BR-74 and OQ-06. THIS MIGRATION ONLY
   CONFIGURES SCHEDULING. It must be reviewed separately from part 1
   (20261018000000_chat_retention_cleanup_function.sql), which defines the
   cleanup function, and must not be applied until the owner approves
   activating scheduled deletion.

2. Scheduling
   - Job name: chat_retention_cleanup_job (fixed name, not a numeric ID).
   - Idempotent re-apply: the job is unscheduled first ONLY if it already
     exists, so a first apply and a re-apply both work and a duplicate job
     can never be created. (This project's pg_cron build raises an error for
     cron.unschedule on a non-existent job name, hence the guarded form.)
   - Timing: '17 4 * * *' — daily at 04:17 UTC.
   - The command calls public.cleanup_expired_anonymous_chats(90) directly:
     database-side, no HTTP, no secrets, no Edge Function.
   - Deletion happens at the first scheduled run after the 90-day inactivity
     threshold is passed.

3. Prerequisite
   - Part 1 (the cleanup function) must be applied first.

4. Important Notes
   - APPLYING THIS MIGRATION ACTIVATES SCHEDULED DELETION.
   - Owner-approved for activation.
*/

DO $guard$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'chat_retention_cleanup_job') THEN
    PERFORM cron.unschedule('chat_retention_cleanup_job');
  END IF;
END;
$guard$;

SELECT cron.schedule(
  'chat_retention_cleanup_job',
  '17 4 * * *',
  $cmd$
  SELECT public.cleanup_expired_anonymous_chats(90);
  $cmd$
);
