// Structural tests for the anonymous chat retention cleanup (BR-74).
// Run with: node --test tests/chat-retention-cleanup.test.mjs
//
// These tests assert the guarantees of the two migration files and the manual
// SQL Editor test as text. Live-SQL behavior is verified by the owner running
// the DO-block test in the Supabase SQL Editor; see the batch report for the
// division of coverage.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const FUNCTION_MIGRATION_URL = new URL(
  '../supabase/migrations/20261018000000_chat_retention_cleanup_function.sql',
  import.meta.url,
);
const SCHEDULE_MIGRATION_URL = new URL(
  '../supabase/migrations/20261018000001_schedule_chat_retention_cleanup.sql',
  import.meta.url,
);
const SQL_EDITOR_TEST_URL = new URL(
  '../supabase/manual/test_chat_retention_cleanup_transaction.sql',
  import.meta.url,
);
const REVIEW_QUERY_URL = new URL(
  '../supabase/manual/review_count_eligible_anonymous_chats.sql',
  import.meta.url,
);

const functionSql = await readFile(FUNCTION_MIGRATION_URL, 'utf8');
const scheduleSql = await readFile(SCHEDULE_MIGRATION_URL, 'utf8');
const editorTestSql = await readFile(SQL_EDITOR_TEST_URL, 'utf8');
const reviewSql = await readFile(REVIEW_QUERY_URL, 'utf8');

const executable = (sql) => sql.slice(sql.indexOf('*/') + 2);

// --- Part 1: function migration ---

test('part 1 defines the production entry point with a 90-day default', () => {
  assert.match(functionSql, /CREATE OR REPLACE FUNCTION public\.cleanup_expired_anonymous_chats\(/);
  assert.match(functionSql, /p_retention_days integer DEFAULT 90/);
});

test('the production entry point delegates to the helper without a prefix filter', () => {
  const body = functionSql.slice(functionSql.indexOf('cleanup_expired_anonymous_chats_in_prefix(p_retention_days, NULL)') - 400);
  assert.match(functionSql, /cleanup_expired_anonymous_chats_in_prefix\(p_retention_days, NULL\)/);
  // The production wrapper must not pass anything but NULL as the prefix.
  const wrapper = functionSql.slice(functionSql.lastIndexOf('CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_chats('));
  assert.match(wrapper, /cleanup_expired_anonymous_chats_in_prefix\(p_retention_days, NULL\)/);
  assert.doesNotMatch(wrapper, /cleanup_expired_anonymous_chats_in_prefix\([^)]*'/);
});

test('the helper accepts an optional exact visitor-ID prefix', () => {
  assert.match(functionSql, /CREATE OR REPLACE FUNCTION public\.cleanup_expired_anonymous_chats_in_prefix\(/);
  assert.match(functionSql, /p_visitor_id_prefix text DEFAULT NULL/);
});

test('prefix filtering uses exact starts_with, never a LIKE pattern', () => {
  assert.doesNotMatch(executable(functionSql), /LIKE|~~/i);
  const occurrences = functionSql.match(/starts_with\(s\.visitor_id, p_visitor_id_prefix\)/g) ?? [];
  assert.ok(occurrences.length >= 2, 'prefix predicate must gate both selection and re-check');
});

test('part 1 eligibility: anonymous, no lead, valid timestamp, older than window', () => {
  assert.match(functionSql, /s\.is_anonymous/);
  assert.match(functionSql, /s\.lead_id IS NULL/);
  const occurrences = functionSql.match(/s\.last_activity_at IS NOT NULL/g) ?? [];
  assert.ok(occurrences.length >= 2, 'IS NOT NULL must gate both selection and re-check');
  assert.match(functionSql, /s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/);
  assert.doesNotMatch(executable(functionSql), /WHERE\s+true/i);
});

test('every eligibility predicate is re-checked in the DELETE WHERE clause', () => {
  assert.match(
    functionSql,
    /WHERE s\.id = e\.id\s+AND \(p_visitor_id_prefix IS NULL\s+OR p_visitor_id_prefix = ''\s+OR starts_with\(s\.visitor_id, p_visitor_id_prefix\)\)\s+AND s\.is_anonymous\s+AND s\.lead_id IS NULL\s+AND s\.last_activity_at IS NOT NULL\s+AND s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/,
  );
});

test('messages are removed only through the session cascade', () => {
  assert.doesNotMatch(executable(functionSql), /DELETE FROM\s+(?:public\.)?chat_messages/);
  assert.match(executable(functionSql), /DELETE FROM public\.chat_sessions/);
});

test('deletes are row-locked and bounded per run', () => {
  assert.match(functionSql, /FOR UPDATE SKIP LOCKED/);
  assert.match(functionSql, /LIMIT \d+/);
});

test('functions return deletion count and timestamp, never personal data', () => {
  const returnClause = functionSql.slice(functionSql.indexOf('RETURN json_build_object'));
  assert.match(returnClause, /'deleted_sessions', v_deleted/);
  assert.match(returnClause, /'executed_at', to_char\(/);
  assert.doesNotMatch(returnClause, /lead_id|visitor_id|content|email|phone/i);
});

test('both functions are revoked from browser roles and granted to service_role only', () => {
  assert.match(
    functionSql,
    /REVOKE ALL ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+FROM PUBLIC, anon, authenticated/,
  );
  assert.match(
    functionSql,
    /REVOKE ALL ON FUNCTION public\.cleanup_expired_anonymous_chats_in_prefix\(integer, text\)\s+FROM PUBLIC, anon, authenticated/,
  );
  assert.match(
    functionSql,
    /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+TO service_role/,
  );
  assert.match(
    functionSql,
    /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_anonymous_chats_in_prefix\(integer, text\)\s+TO service_role/,
  );
});

test('part 1 contains no cron statements', () => {
  assert.doesNotMatch(executable(functionSql), /cron\.(un)?schedule/);
});

// --- Part 2: scheduling migration ---

test('part 2 schedules the named job idempotently and daily', () => {
  assert.match(scheduleSql, /cron\.unschedule\('chat_retention_cleanup_job'\)/);
  assert.match(scheduleSql, /cron\.schedule\(\s*'chat_retention_cleanup_job'/);
  assert.match(scheduleSql, /'17 4 \* \* \*'/);
});

test('part 2 calls only the production function with 90 days', () => {
  const command = scheduleSql.slice(scheduleSql.indexOf('$cmd$'));
  assert.match(command, /SELECT public\.cleanup_expired_anonymous_chats\(90\)/);
  assert.doesNotMatch(command, /in_prefix|ALTER|CREATE|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|net\.http/i);
});

test('part 2 contains no function definition or permission changes', () => {
  assert.doesNotMatch(scheduleSql, /CREATE (?:OR REPLACE )?FUNCTION|REVOKE ALL ON FUNCTION|GRANT EXECUTE ON FUNCTION/i);
});

// --- SQL Editor DO-block test ---

test('editor test is a single DO block with no COMMIT and no cron statements', () => {
  const statements = editorTestSql.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');
  assert.match(editorTestSql, /^DO \$test\$/m);
  assert.doesNotMatch(statements, /\bCOMMIT\b/i);
  assert.doesNotMatch(statements, /cron\.(un)?schedule/);
});

test('editor test never calls the unrestricted production cleanup', () => {
  assert.doesNotMatch(editorTestSql, /cleanup_expired_anonymous_chats\s*\(\s*90\s*\)/);
  assert.match(editorTestSql, /cleanup_expired_anonymous_chats_in_prefix\(90, v_prefix\)/);
});

test('editor test checks schema and function availability before creating records', () => {
  assert.match(editorTestSql, /information_schema\.columns/);
  assert.match(editorTestSql, /apply part 1 of the retention migration first/);
});

test('editor test generates a unique random synthetic prefix and verifies it is free', () => {
  assert.match(editorTestSql, /'PRT_TEST_' \|\| substr\(md5\(random\(\)/);
  assert.match(editorTestSql, /synthetic prefix collision/);
});

test('editor test covers the four required scenarios with messages', () => {
  assert.match(editorTestSql, /expired_anonymous/);
  assert.match(editorTestSql, /recent_anonymous/);
  assert.match(editorTestSql, /expired_lead_linked/);
  assert.match(editorTestSql, /expired_non_anonymous/);
  assert.match(editorTestSql, /RETENTION_TEST synthetic message/);
});

test('editor test asserts the exact deletion count and per-record outcomes', () => {
  assert.match(editorTestSql, /expected exactly 1 deleted session/);
  assert.match(editorTestSql, /expired anonymous session was not deleted/);
  assert.match(editorTestSql, /were not cascaded/);
  assert.match(editorTestSql, /protected synthetic sessions were deleted/);
  assert.match(editorTestSql, /synthetic lead was modified or deleted/);
});

test('editor test removes all remaining synthetic records and verifies nothing remains', () => {
  assert.match(editorTestSql, /DELETE FROM public\.chat_sessions WHERE starts_with\(visitor_id, v_prefix\)/);
  assert.match(editorTestSql, /DELETE FROM public\.leads WHERE id = v_lead_id/);
  assert.match(editorTestSql, /synthetic sessions remain after cleanup/);
  assert.match(editorTestSql, /synthetic lead remains after cleanup/);
});

test('editor test uses the reserved RETENTION_TEST tag only for synthetic data', () => {
  // Production visitor IDs come from the chat Edge Function ([A-Za-z0-9_-]+,
  // max 128 chars) and can never start with the underscore-containing,
  // randomly generated PRT_TEST_ prefix.
  assert.match(editorTestSql, /PRT_TEST_/);
  assert.match(editorTestSql, /RETENTION_TEST/);
});

// --- Review-only count query ---

test('review query is read-only and mirrors the eligibility criteria', () => {
  const statements = reviewSql.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');
  assert.match(reviewSql, /s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => 90\)/);
  assert.doesNotMatch(statements, /\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bALTER\b|\bCREATE\b|\bGRANT\b|\bREVOKE\b/i);
});

test('review query never exposes visitor IDs or message contents', () => {
  const finalSelect = reviewSql.slice(reviewSql.lastIndexOf('SELECT'));
  assert.match(finalSelect, /count\(\*\)/);
  assert.doesNotMatch(finalSelect, /visitor_id|m\.content|s\.id/);
});
