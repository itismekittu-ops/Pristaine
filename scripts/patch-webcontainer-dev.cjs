// scripts/patch-webcontainer-dev.cjs
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = process.cwd();
const nextDist = path.join(root, "node_modules", "next", "dist");
const marker = "/* BOLT_WEBCONTAINER_PATCHED_V2 */";

function getAllJsFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsFiles(fullPath, results);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".js") ||
        entry.name.endsWith(".cjs") ||
        entry.name.endsWith(".mjs"))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function patchFileContent(content) {
  if (content.includes(marker)) return content;
  if (!content.includes("Expected workUnitAsyncStorage to have a store")) {
    return content;
  }

  let updated = content;

  // 1. Neutralize `function throwInvariantForMissingStore() { throw new ... }`
  // In Next.js 15.5.x, `params.js` and `search-params.js` have:
  //   if (workUnitStore) { switch (...) { ... } } else { throwInvariantForMissingStore(); }
  //   return createRenderParamsInDev(underlyingParams, void 0, workStore);
  // By making `throwInvariantForMissingStore()` return undefined instead of throwing,
  // execution naturally falls through to `return createRenderParamsInDev(...)` / `createRenderSearchParamsInDev(...)`!
  updated = updated.replace(
    /function\s+throwInvariantForMissingStore\s*\(\s*\)\s*\{[\s\S]*?Expected workUnitAsyncStorage to have a store[\s\S]*?\}/g,
    `function throwInvariantForMissingStore() { ${marker} return; }`
  );

  // 2. Catch any direct inline throws of "Expected workUnitAsyncStorage to have a store"
  // (e.g., in compiled app-page.runtime.dev.js or work-unit-async-storage)
  updated = updated.replace(
    /throw\s+new\s+[a-zA-Z0-9_$.]*InvariantError\s*\(\s*["'`]Expected workUnitAsyncStorage to have a store[\s\S]*?\)\s*;?/g,
    `{ ${marker} }`
  );

  return updated;
}

// Scan server/, esm/server/, and compiled/next-server/
const targetDirs = [
  path.join(nextDist, "server"),
  path.join(nextDist, "esm", "server"),
  path.join(nextDist, "compiled", "next-server"),
];

const targetFiles = [];
for (const dir of targetDirs) {
  getAllJsFiles(dir, targetFiles);
}

let patchedCount = 0;
for (const file of targetFiles) {
  try {
    const backupPath = file + ".bolt-original";
    // Always start from the clean original if a backup exists
    const sourceContent = fs.existsSync(backupPath)
      ? fs.readFileSync(backupPath, "utf8")
      : fs.readFileSync(file, "utf8");

    if (
      !sourceContent.includes("Expected workUnitAsyncStorage to have a store")
    ) {
      continue;
    }

    const patched = patchFileContent(sourceContent);
    if (patched !== sourceContent) {
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(file, backupPath);
      }
      fs.writeFileSync(file, patched, "utf8");
      patchedCount++;
      console.log(`[WebContainer Fix] Patched: ${path.relative(root, file)}`);
    }
  } catch (err) {
    console.warn(`[WebContainer Fix] Failed to patch ${file}:`, err.message);
  }
}

// Clear Next.js `.next` cache so stale server chunks don't keep the old throw
const dotNextDir = path.join(root, ".next");
if (fs.existsSync(dotNextDir)) {
  try {
    fs.rmSync(dotNextDir, { recursive: true, force: true });
    console.log("[WebContainer Fix] Cleared .next cache.");
  } catch (_) {}
}

console.log(`[WebContainer Fix] Ready (${patchedCount} file(s) patched).`);

if (process.argv.includes("--patch-only")) {
  process.exit(0);
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const extraArgs = process.argv.slice(2);

const child = spawn(process.execPath, [nextBin, "dev", ...extraArgs], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});