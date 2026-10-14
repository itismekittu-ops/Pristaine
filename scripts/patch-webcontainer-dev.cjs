
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = process.cwd();
const nextPackagePath = path.join(
  root, "node_modules", "next", "package.json"
);
const paramsPath = path.join(
  root, "node_modules", "next", "dist",
  "server", "request", "params.js"
);
const backupPath = paramsPath + ".bolt-original";
const marker = "BOLT_WEBCONTAINER_DEV_ONLY_FALLBACK";

function restoreBackup() {
  if (!fs.existsSync(backupPath)) return false;
  fs.copyFileSync(backupPath, paramsPath);
  fs.unlinkSync(backupPath);
  return true;
}

function fail(message) {
  console.error(`WebContainer workaround stopped: ${message}`);
  process.exit(1);
}

// Recover the original file if a previous run stopped unexpectedly.
restoreBackup();

if (process.argv.includes("--restore")) {
  console.log("Restored any saved Next.js backup.");
  process.exit(0);
}

if (!fs.existsSync(nextPackagePath) || !fs.existsSync(paramsPath)) {
  fail("Next.js files not found. No patch applied.");
}

const version = JSON.parse(
  fs.readFileSync(nextPackagePath, "utf8")
).version;

if (version !== "15.5.27") {
  fail(`Expected Next.js 15.5.27; found ${version}.`);
}

const original = fs.readFileSync(paramsPath, "utf8");

if (!original.includes("createRenderParamsInDev")) {
  fail("Expected Next.js helper not found. No patch applied.");
}

const pattern =
  /(function createServerParamsForServerSegment\s*\([^)]*\)\s*\{[\s\S]*?)throwInvariantForMissingStore\(\)\s*;?/;

const patched = original.replace(
  pattern,
  (_, functionStart) =>
    `${functionStart}return createRenderParamsInDev(underlyingParams, void 0, workStore); /* ${marker} */`
);

if (patched === original || !patched.includes(marker)) {
  fail("Expected function pattern not found. No patch applied.");
}

// Save the exact original file before applying the development workaround.
fs.copyFileSync(paramsPath, backupPath);

try {
  fs.writeFileSync(paramsPath, patched, "utf8");
} catch (error) {
  restoreBackup();
  throw error;
}

let restored = false;

function restoreOriginal() {
  if (restored) return;
  restored = true;
  restoreBackup();
}

process.on("exit", restoreOriginal);

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (child.exitCode === null) child.kill(signal);
    else restoreOriginal();
  });
}

child.on("error", (error) => {
  console.error("Could not start Next.js:", error.message);
  restoreOriginal();
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  restoreOriginal();
  process.exitCode = code ?? (signal ? 1 : 0);
});
