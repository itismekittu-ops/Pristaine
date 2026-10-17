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
   - cron.unschedule('chat_retention_cleanup_job') runs before cron.schedule,
     so re-applying this migration can never create a duplicate job.
   - Timing: '17 4 * * *' — daily at 04:17 UTC.
   - The command calls public.cleanup_expired_anonymous_chats(90) directly:
     database-side, no HTTP, no secrets, no Edge Function.
   - Deletion happens at the first scheduled run after the 90-day inactivity
     threshold is passed.

3. Prerequisite
   - Part 1 (the cleanup function) must be applied first.

4. Important Notes
   - APPLYING THIS MIGRATION ACTIVATES SCHEDULED DELETION.
   - DO NOT APPLY UNTIL THE OWNER EXPLICITLY APPROVES ACTIVATION.
*/

SELECT cron.unschedule('chat_retention_cleanup_job');

SELECT cron.schedule(
  'chat_retention_cleanup_job',
  '17 4 * * *',
  $cmd$
  SELECT public.cleanup_expired_anonymous_chats(90);
  $cmd$
);
