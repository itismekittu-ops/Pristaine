#!/usr/bin/env node
/**
 * Generate idempotent SQL to synchronize versioned approved-answer JSON with
 * public.approved_answers. This script does NOT connect to Supabase or execute SQL.
 * Run from repository root: node scripts/build-approved-answers-sql.mjs
 * Permanent deletes require both an explicit UUID manifest and --confirm-delete.
 */
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "approved-answers");
const OUTPUT = path.join(ROOT, "supabase", "manual", "sync-approved-answers.sql");
const allowedStatuses = new Set(["active", "draft", "retired"]);
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const confirmDelete = process.argv.includes("--confirm-delete");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function normalize(text) {
  return text.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
function sqlTextArray(values) {
  return `ARRAY[${values.map(sqlString).join(", ")}]::text[]`;
}

async function main() {
  const names = (await readdir(CONTENT_DIR))
    .filter((name) => /^\d+-.+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b));
  assert(names.length > 0, `No numbered content JSON files found in ${CONTENT_DIR}`);

  const entries = [];
  const entryIds = new Set();
  const variantOwners = new Map();
  let contentVersion = "unspecified";

  for (const name of names) {
    const file = path.join(CONTENT_DIR, name);
    const parsed = JSON.parse(await readFile(file, "utf8"));
    assert(Array.isArray(parsed.entries), `${name}: expected an entries array`);
    if (parsed.content_version) contentVersion = parsed.content_version;
    for (const entry of parsed.entries) {
      const where = `${name} / ${entry?.topic ?? "unknown topic"}`;
      assert(entry && typeof entry === "object", `${where}: entry must be an object`);
      assert(uuidRe.test(entry.id ?? ""), `${where}: id must be a stable UUID`);
      assert(typeof entry.topic === "string" && entry.topic.trim(), `${where}: topic is required`);
      assert(Array.isArray(entry.question_variants) && entry.question_variants.length > 0,
        `${where}: question_variants must be a non-empty array`);
      assert(entry.question_variants.every((v) => typeof v === "string" && v.trim()),
        `${where}: question_variants must contain non-empty strings`);
      assert(typeof entry.answer === "string" && entry.answer.trim(), `${where}: answer is required`);
      assert(typeof entry.version === "string" && entry.version.trim(), `${where}: version is required`);
      assert(allowedStatuses.has(entry.status), `${where}: status must be active, draft, or retired`);
      assert(!entryIds.has(entry.id.toLowerCase()), `${where}: duplicate ID ${entry.id}`);
      entryIds.add(entry.id.toLowerCase());
      for (const variant of entry.question_variants) {
        const key = normalize(variant);
        assert(key.length > 0, `${where}: question variant becomes empty after normalization`);
        const existing = variantOwners.get(key);
        assert(!existing, `${where}: duplicate normalized question variant ${JSON.stringify(variant)} also appears in ${existing}`);
        variantOwners.set(key, where);
      }
      entries.push({
        id: entry.id.toLowerCase(), topic: entry.topic.trim(),
        question_variants: entry.question_variants.map((v) => v.trim()),
        answer: entry.answer.trim(), version: entry.version.trim(), status: entry.status,
      });
    }
  }

  const deletionFile = path.join(CONTENT_DIR, "deleted-answer-ids.json");
  const deleteManifest = JSON.parse(await readFile(deletionFile, "utf8"));
  const deleteIds = deleteManifest.ids;
  assert(Array.isArray(deleteIds), "deleted-answer-ids.json must contain an ids array");
  const deleteSet = new Set();
  for (const id of deleteIds) {
    assert(uuidRe.test(id), `Deletion manifest contains invalid UUID: ${id}`);
    const normalizedId = id.toLowerCase();
    assert(!deleteSet.has(normalizedId), `Duplicate UUID in deletion manifest: ${id}`);
    assert(!entryIds.has(normalizedId), `UUID ${id} is both in the content library and deletion manifest`);
    deleteSet.add(normalizedId);
  }
  assert(deleteSet.size === 0 || confirmDelete,
    `Permanent deletion requested for ${deleteSet.size} record(s). Prefer status=retired. If permanent deletion is intended, re-run with --confirm-delete and review the generated SQL carefully.`);

  const groups = [];
  for (const e of entries) {
    groups.push(`  (${sqlString(e.id)}::uuid, ${sqlString(e.topic)}, ${sqlTextArray(e.question_variants)}, ${sqlString(e.answer)}, ${sqlString(e.version)}, ${sqlString(e.status)})`);
  }
  const lines = [
    `-- GENERATED FILE. Source: content/approved-answers/*.json (content version: ${contentVersion}).`,
    "-- Review this SQL before running it in Supabase SQL Editor; this script never executes it.",
    "-- Existing rows are matched by stable UUID. Missing source entries are NOT auto-deleted.",
    "BEGIN;",
    "INSERT INTO public.approved_answers (id, topic, question_variants, answer, version, status)",
    "VALUES",
    groups.join(",\n"),
    "ON CONFLICT (id) DO UPDATE SET",
    "  topic = EXCLUDED.topic,",
    "  question_variants = EXCLUDED.question_variants,",
    "  answer = EXCLUDED.answer,",
    "  version = EXCLUDED.version,",
    "  status = EXCLUDED.status,",
    "  updated_at = now();",
  ];
  if (deleteSet.size > 0) {
    lines.push(
      "",
      "-- DESTRUCTIVE: these IDs were explicitly listed in deleted-answer-ids.json.",
      "-- Confirm dependent references and retention requirements before running this SQL.",
      `DELETE FROM public.approved_answers WHERE id IN (${[...deleteSet].map((id) => `${sqlString(id)}::uuid`).join(", ")});`
    );
  } else {
    lines.push("", "-- No permanent deletion requested.");
  }
  lines.push("COMMIT;", "");
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, lines.join("\n"), "utf8");
  const statusCounts = entries.reduce((acc, entry) => (acc[entry.status] = (acc[entry.status] ?? 0) + 1, acc), {});
  console.log(`Validated ${entries.length} answer records from ${names.length} topic files.`);
  console.log(`Statuses: ${Object.entries(statusCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`Explicit permanent deletions: ${deleteSet.size}`);
  console.log(`Generated: ${path.relative(ROOT, OUTPUT)}`);
  console.log("Nothing was sent to or changed in Supabase. Inspect the SQL, then run it manually only after content approval.");
}

main().catch((error) => {
  console.error(`Approved-answer SQL generation failed: ${error.message}`);
  process.exitCode = 1;
});
