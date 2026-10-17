// Structural tests for the anonymous chat retention cleanup (BR-74).
// Run with: node --test tests/chat-retention-cleanup.test.mjs
//
// No Supabase integration is available in this environment, so these tests
// assert the guarantees of the two migration files as text (eligibility
// criteria, delete mechanics, security grants, separation of function and
// scheduling). Live-SQL behavior is NOT integration-tested here; a separate
// transaction-based test script under supabase/manual/ covers that path when
// an owner runs it in the Supabase SQL Editor or psql.

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
const TX_TEST_URL = new URL(
  '../supabase/manual/test_chat_retention_cleanup_transaction.sql',
  import.meta.url,
);
const REVIEW_QUERY_URL = new URL(
  '../supabase/manual/review_count_eligible_anonymous_chats.sql',
  import.meta.url,
);

const functionSql = await readFile(FUNCTION_MIGRATION_URL, 'utf8');
const scheduleSql = await readFile(SCHEDULE_MIGRATION_URL, 'utf8');
const txTestSql = await readFile(TX_TEST_URL, 'utf8');
const reviewSql = await readFile(REVIEW_QUERY_URL, 'utf8');

// --- Part 1: function migration ---

test('part 1 defines the cleanup function with a 90-day default', () => {
  assert.match(functionSql, /CREATE OR REPLACE FUNCTION public\.cleanup_expired_anonymous_chats\(/);
  assert.match(functionSql, /p_retention_days integer DEFAULT 90/);
});

test('part 1 eligibility: explicitly anonymous, no linked lead, valid timestamp, older than window', () => {
  assert.match(functionSql, /s\.is_anonymous/);
  assert.match(functionSql, /s\.lead_id IS NULL/);
  assert.match(functionSql, /s\.last_activity_at IS NOT NULL/);
  assert.match(functionSql, /s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/);
  assert.doesNotMatch(functionSql, /WHERE\s+true/i);
});

test('part 1 re-checks eligibility at deletion time (both places gate NULL timestamps)', () => {
  const occurrences = functionSql.match(/s\.last_activity_at IS NOT NULL/g) ?? [];
  assert.ok(occurrences.length >= 2, 'IS NOT NULL must gate both selection and re-check');
  assert.match(
    functionSql,
    /WHERE s\.id = e\.id\s+AND s\.is_anonymous\s+AND s\.lead_id IS NULL\s+AND s\.last_activity_at IS NOT NULL\s+AND s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => p_retention_days\)/,
  );
});

test('part 1 removes messages only through the session cascade', () => {
  assert.doesNotMatch(functionSql, /DELETE FROM\s+(?:public\.)?chat_messages/);
  assert.match(functionSql, /DELETE FROM public\.chat_sessions/);
});

test('part 1 uses row locking and a bounded batch', () => {
  assert.match(functionSql, /FOR UPDATE SKIP LOCKED/);
  assert.match(functionSql, /LIMIT \d+/);
});

test('part 1 returns deletion count and timestamp, never personal data', () => {
  assert.match(functionSql, /'deleted_sessions', v_deleted/);
  assert.match(functionSql, /'executed_at', to_char\(/);
  const returnClause = functionSql.slice(functionSql.indexOf('RETURN json_build_object'));
  assert.doesNotMatch(returnClause, /lead_id|visitor_id|content|email|phone/i);
});

test('part 1 grants execution to service_role only', () => {
  assert.match(
    functionSql,
    /REVOKE ALL ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+FROM PUBLIC, anon, authenticated/,
  );
  assert.match(
    functionSql,
    /GRANT EXECUTE ON FUNCTION public\.cleanup_expired_anonymous_chats\(integer\)\s+TO service_role/,
  );
});

test('part 1 contains no cron scheduling statements', () => {
  // Strip the explanatory header so prose mentions don't count as statements.
  const executableSql = functionSql.slice(functionSql.indexOf('*/') + 2);
  assert.doesNotMatch(executableSql, /cron\.(un)?schedule/);
});

// --- Part 2: scheduling migration ---

test('part 2 schedules the named job idempotently and daily', () => {
  assert.match(scheduleSql, /cron\.unschedule\('chat_retention_cleanup_job'\)/);
  assert.match(scheduleSql, /cron\.schedule\(\s*'chat_retention_cleanup_job'/);
  assert.match(scheduleSql, /'17 4 \* \* \*'/);
});

test('part 2 calls the cleanup function with 90 days and nothing else', () => {
  const command = scheduleSql.slice(scheduleSql.indexOf('$cmd$'));
  assert.match(command, /SELECT public\.cleanup_expired_anonymous_chats\(90\)/);
  assert.doesNotMatch(command, /ALTER|CREATE|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|net\.http/i);
});

test('part 2 contains no function definition or permission changes', () => {
  assert.doesNotMatch(scheduleSql, /CREATE (?:OR REPLACE )?FUNCTION|REVOKE ALL ON FUNCTION|GRANT EXECUTE ON FUNCTION/i);
});

// --- Transaction test script (review-only artifact) ---

test('transaction test uses an explicit transaction with no COMMIT', () => {
  assert.match(txTestSql, /^BEGIN;/m);
  assert.match(txTestSql, /^ROLLBACK;/m);
  assert.doesNotMatch(txTestSql, /^\s*COMMIT\s*;/m);
});

test('transaction test contains no cron statements', () => {
  assert.doesNotMatch(txTestSql, /cron\.(un)?schedule/);
});

test('transaction test checks schema before creating synthetic records', () => {
  assert.match(txTestSql, /information_schema\.columns/);
  assert.match(txTestSql, /cleanup_expired_anonymous_chats not found/);
});

test('transaction test tags all synthetic rows and covers the four required scenarios', () => {
  assert.match(txTestSql, /RETENTION_TEST_/);
  assert.match(txTestSql, /expired_anonymous/);
  assert.match(txTestSql, /recent_anonymous/);
  assert.match(txTestSql, /expired_lead_linked/);
  assert.match(txTestSql, /expired_non_anonymous/);
});

test('transaction test invokes the real function and checks the returned count', () => {
  assert.match(txTestSql, /SELECT public\.cleanup_expired_anonymous_chats\(90\) AS cleanup_result/);
});

test('transaction test verifies per-key deletion and preserved records', () => {
  assert.match(txTestSql, /actually_deleted/);
  assert.match(txTestSql, /pass/);
  assert.match(txTestSql, /synthetic_lead_preserved/);
});

test('transaction test rolls back in a temp-table setup that vanishes at commit', () => {
  assert.match(txTestSql, /CREATE TEMP TABLE synthetic_setup ON COMMIT DROP/);
});

// --- Review-only count query ---

test('review query is read-only and mirrors the eligibility criteria', () => {
  // Strip leading comment lines so prose words like "deletion" don't count.
  const statements = reviewSql.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');
  assert.match(reviewSql, /is_anonymous\s*(?:\n|)*\s*AND s\.lead_id IS NULL/s);
  assert.match(reviewSql, /s\.last_activity_at < clock_timestamp\(\) - make_interval\(days => 90\)/);
  assert.doesNotMatch(statements, /\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bALTER\b|\bCREATE\b|\bGRANT\b|\bREVOKE\b/i);
});

test('review query never exposes visitor IDs or message contents', () => {
  const finalSelect = reviewSql.slice(reviewSql.lastIndexOf('SELECT'));
  assert.match(finalSelect, /count\(\*\)/);
  assert.doesNotMatch(finalSelect, /visitor_id|m\.content|s\.id/);
});
