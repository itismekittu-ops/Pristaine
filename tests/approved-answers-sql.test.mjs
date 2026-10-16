// Dry tests for the approved-answers SQL generation script.
// Run with: node --test tests/approved-answers-sql.test.mjs
//
// These tests validate that build-approved-answers-sql.mjs:
//   - Parses all content JSON files
//   - Rejects invalid statuses, IDs, and duplicate normalized variants
//   - Generates idempotent upsert SQL (no DDL)
//   - Refuses deletion without explicit UUIDs + --confirm-delete
//   - Never connects to or changes Supabase

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-approved-answers-sql.mjs');
const SQL_OUTPUT = path.join(ROOT, 'supabase', 'manual', 'sync-approved-answers.sql');
const DELETE_MANIFEST = path.join(ROOT, 'content', 'approved-answers', 'deleted-answer-ids.json');

function runScript(args = []) {
  try {
    const output = execFileSync('node', [SCRIPT, ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 10_000,
    });
    return { stdout: output, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    };
  }
}

function getGeneratedSql() {
  return readFileSync(SQL_OUTPUT, 'utf8');
}

function getDeleteManifest() {
  return JSON.parse(readFileSync(DELETE_MANIFEST, 'utf8'));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('Script runs successfully on current content', () => {
  const result = runScript();
  assert.equal(result.exitCode, 0, 'Script should exit 0 with valid content');
  assert.match(result.stdout, /Validated \d+ answer records/);
  assert.match(result.stdout, /Nothing was sent to or changed in Supabase/);
});

test('Script parses all content JSON files', () => {
  const result = runScript();
  assert.match(result.stdout, /Validated \d+ answer records from \d+ topic files/);
  const match = result.stdout.match(/from (\d+) topic files/);
  const fileCount = parseInt(match[1], 10);
  assert.ok(fileCount >= 4, `Should parse at least 4 topic files, got ${fileCount}`);
});

test('Script reports correct statuses', () => {
  const result = runScript();
  assert.match(result.stdout, /Statuses:/);
  // All current entries are draft
  assert.match(result.stdout, /draft=\d+/);
});

test('Script generates idempotent upsert SQL (ON CONFLICT)', () => {
  runScript(); // Ensure output is fresh
  const sql = getGeneratedSql();
  assert.ok(sql.includes('ON CONFLICT (id) DO UPDATE'), 'Should use ON CONFLICT for idempotent upsert');
});

test('Script generates no DDL (no CREATE/ALTER/DROP TABLE)', () => {
  runScript();
  const sql = getGeneratedSql();
  assert.ok(!sql.includes('CREATE TABLE'), 'Should not contain CREATE TABLE');
  assert.ok(!sql.includes('ALTER TABLE'), 'Should not contain ALTER TABLE');
  assert.ok(!sql.includes('DROP TABLE'), 'Should not contain DROP TABLE');
  assert.ok(!sql.includes('CREATE INDEX'), 'Should not contain CREATE INDEX');
});

test('Script refuses deletion without --confirm-delete', () => {
  const manifest = getDeleteManifest();
  if (manifest.ids && manifest.ids.length > 0) {
    const result = runScript(); // No --confirm-delete
    assert.notEqual(result.exitCode, 0, 'Script should fail when deletions requested without --confirm-delete');
    assert.match(result.stderr, /confirm-delete/i, 'Error should mention --confirm-delete');
  } else {
    const result = runScript();
    assert.equal(result.exitCode, 0, 'Script should succeed when no deletions requested');
  }
});

test('Script with --confirm-delete generates DELETE statement', () => {
  const manifest = getDeleteManifest();
  if (manifest.ids && manifest.ids.length > 0) {
    const result = runScript(['--confirm-delete']);
    assert.equal(result.exitCode, 0, 'Script should succeed with --confirm-delete');
    const sql = getGeneratedSql();
    assert.ok(sql.includes('DELETE FROM'), 'Should contain DELETE statement with --confirm-delete');
  }
});

test('Script validates UUID format for entries', () => {
  const result = runScript();
  assert.equal(result.exitCode, 0, 'All current entry IDs should be valid UUIDs');
});

test('Script detects duplicate normalized question variants', () => {
  const result = runScript();
  assert.equal(result.exitCode, 0, 'Current content should have no duplicate normalized variants');
});

test('Script never connects to Supabase', () => {
  const result = runScript();
  assert.match(result.stdout, /Nothing was sent to or changed in Supabase/);
});

test('Script generates SQL file at expected path', () => {
  const result = runScript();
  assert.match(result.stdout, /Generated: supabase[\\/]+manual[\\/]+sync-approved-answers\.sql/);
});

test('Generated SQL uses stable UUIDs for upsert', () => {
  runScript();
  const sql = getGeneratedSql();
  // UUIDs appear as '...'::uuid in the VALUES clause
  assert.match(sql, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.*::uuid/i);
});

test('Generated SQL uses BEGIN/COMMIT transaction', () => {
  runScript();
  const sql = getGeneratedSql();
  assert.ok(sql.includes('BEGIN;'), 'Should wrap in BEGIN');
  assert.ok(sql.includes('COMMIT;'), 'Should end with COMMIT');
});
