// Structural tests for the anonymous chat retention cleanup (BR-74).
// Run with: node --test tests/chat-retention-cleanup.test.mjs
//
// No Supabase integration is available in this environment, so these tests
// assert the guarantees of the migration SQL as text (eligibility criteria,
// delete mechanics, security grants, idempotent scheduling). Live-SQL behavior
// is NOT integration-tested here; see the batch report for the distinction.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sql = await readFile(
  new URL('../supabase/migrations/20261018000000_anonymous_chat_retention_cleanup.sql', import.meta.url),
  'utf8',
);

// --- Deletion criteria (all must be present as explicit predicates) ---

test('eligibility requires explicitly anonymous sessions', () => {
  assert.match(sql, /s\.is_anonymous/);
  assert.doesNotMatch(sql, /WHERE\s+true/i);
});

test('eligibility requires no linked lead', () => {
  assert.match(sql, /s\.lead_id IS NULL/);
});

test('eligibility requires a usable last-activity timestamp older than the window', () => {
  assert.match(sql, /s\.last_activity_at IS NOT NULL/);
  assert.match(sql, /s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/);
});

test('a missing activity timestamp can never qualify for deletion', () => {
  // Both the candidate selection and the delete re-check must exclude NULLs.
  const occurrences = sql.match(/s\.last_activity_at IS NOT NULL/g) ?? [];
  assert.ok(occurrences.length >= 2, 'IS NOT NULL must gate both selection and re-check');
});

// --- Deletion mechanics ---

test('messages are removed through the session cascade, not a separate delete', () => {
  assert.doesNotMatch(sql, /DELETE FROM\s+(?:public\.)?chat_messages/);
  assert.match(sql, /DELETE FROM public\.chat_sessions/);
});

test('deletes are row-locked and concurrency-safe', () => {
  assert.match(sql, /FOR UPDATE SKIP LOCKED/);
});

test('every eligibility predicate is re-checked at deletion time', () => {
  // The DELETE ... USING eligible ... WHERE clause must repeat all conditions.
  assert.match(
    sql,
    /WHERE s\.id = e\.id\s+AND s\.is_anonymous\s+AND s\.lead_id IS NULL\s+AND s\.last_activity_at IS NOT NULL\s+AND s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/,
  );
});

test('each run is bounded', () => {
  assert.match(sql, /LIMIT \d+/);
});

test('the default retention period is 90 days', () => {
  assert.match(sql, /p_retention_days integer DEFAULT 90/);
});

// --- Returned data ---

test('returns deletion count and execution timestamp', () => {
  assert.match(sql, /'deleted_sessions', v_deleted/);
  assert.match(sql, /'executed_at', to_char\(/);
});

test('returns no message content, visitor IDs, emails or other personal data', () => {
  const returnClause = sql.slice(sql.indexOf('RETURN json_build_object'));
  assert.doesNotMatch(returnClause, /lead_id|visitor_id|content|email|phone/i);
});

test('no HubSpot or unrelated records are touched', () => {
  // Strip the explanatory header so prose mentions don't count as SQL references.
  const executableSql = sql.slice(sql.indexOf('*/') + 2);
  assert.doesNotMatch(executableSql, /hubspot|crm_sync_log|bookings|form_submissions|approved_answers|privacy_requests/i);
  assert.doesNotMatch(executableSql, /net\.http/);
});

// --- Security and scheduling ---

test('execute is restricted to service_role only', () => {
  assert.match(
    sql,
    /REVOKE ALL ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+FROM PUBLIC, anon, authenticated/,
  );
  assert.match(
    sql,
    /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+TO service_role/,
  );
});

test('scheduling is idempotent (unschedule before schedule)', () => {
  assert.match(sql, /cron\.unschedule\('chat_retention_cleanup_job'\)/);
  assert.match(sql, /cron\.schedule\(\s*'chat_retention_cleanup_job'/);
});

test('the job runs daily', () => {
  assert.match(sql, /'17 4 \* \* \*'/);
});
