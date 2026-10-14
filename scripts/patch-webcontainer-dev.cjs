// scripts/patch-webcontainer-dev.cjs
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = process.cwd();
const nextDist = path.join(root, "node_modules", "next", "dist");
const marker = "/* BOLT_WEBCONTAINER_PATCHED */";

// Find all relevant server request files and compiled app-page dev runtimes
function getTargetFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getTargetFiles(fullPath, results);
    } else if (
      entry.isFile() &&
      (entry.name === "params.js" ||
        entry.name === "search-params.js" ||
        (entry.name.includes("app-page") && entry.name.endsWith(".dev.js")))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function patchFileContent(content) {
  if (content.includes(marker)) return content;
  if (
    !content.includes("throwInvariantForMissingStore") &&
    !content.includes("Expected workUnitAsyncStorage to have a store")
  ) {
    return content;
  }

  let updated = content;

  // 1. Patch createServerParamsForServerSegment (CJS, ESM, and compiled bundles)
  updated = updated.replace(
    /(function createServerParamsForServerSegment\s*\([^)]*\)\s*\{[\s\S]*?)throwInvariantForMissingStore\(\)\s*;?/g,
    `$1return createRenderParamsInDev(underlyingParams, void 0, workStore); ${marker}`
  );

  // 2. Patch createServerSearchParamsForServerPage (CJS, ESM, and compiled bundles)
  // Note: Next 15.5.x uses either createRenderSearchParamsInDev or createRenderSearchParams
  updated = updated.replace(
    /(function createServerSearchParamsForServerPage\s*\([^)]*\)\s*\{[\s\S]*?)throwInvariantForMissingStore\(\)\s*;?/g,
    `$1return (typeof createRenderSearchParamsInDev === "function" ? createRenderSearchParamsInDev(underlyingSearchParams, workStore) : createRenderSearchParams(underlyingSearchParams, workStore)); ${marker}`
  );

  return updated;
}

const targetFiles = [
  ...getTargetFiles(path.join(nextDist, "server", "request")),
  ...getTargetFiles(path.join(nextDist, "esm", "server", "request")),
  ...getTargetFiles(path.join(nextDist, "compiled", "next-server")),
];

let patchedCount = 0;
for (const file of targetFiles) {
  try {
    // If a backup exists from a previous run, read from the clean backup first
    const backupPath = file + ".bolt-original";
    const sourceContent = fs.existsSync(backupPath)
      ? fs.readFileSync(backupPath, "utf8")
      : fs.readFileSync(file, "utf8");

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

console.log(`[WebContainer Fix] Ready (${patchedCount} file(s) patched).`);

// If run with --patch-only (e.g., from postinstall), exit now and leave files patched in Bolt
if (process.argv.includes("--patch-only")) {
  process.exit(0);
}

// Otherwise, spawn `next dev`
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