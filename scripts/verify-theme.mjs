import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const mobileFeatures = join(repoRoot, "viralcut-mobile", "lib", "features");
const portalSrc = join(repoRoot, "viralcut-web", "apps", "portal", "src");

const failures = [];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (full.endsWith(".dart")) files.push(full);
  }
  return files;
}

function grepDartFeatures(pattern) {
  const re = new RegExp(pattern);
  const hits = [];
  for (const file of walk(mobileFeatures)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (re.test(line)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  return hits;
}

function grepPortal(pattern) {
  const re = new RegExp(pattern, "gi");
  const hits = [];
  function walkTs(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkTs(full);
      else if (/\.(tsx?|css)$/.test(entry)) {
        const content = readFileSync(full, "utf8");
        if (re.test(content)) hits.push(full);
        re.lastIndex = 0;
      }
    }
  }
  walkTs(portalSrc);
  return hits;
}

const tokenLightHits = grepDartFeatures(
  "ViralCutTokenColors\\.\\w+Light",
);
if (tokenLightHits.length) {
  failures.push(
    `Mobile features must not use ViralCutTokenColors.*Light:\n${tokenLightHits.join("\n")}`,
  );
}

const hexHits = grepDartFeatures("Color\\(0x");
if (hexHits.length) {
  failures.push(
    `Mobile features must not use Color(0x...):\n${hexHits.join("\n")}`,
  );
}

const emeraldHits = grepPortal("emerald-");
if (emeraldHits.length) {
  failures.push(
    `Portal must not use emerald-* classes:\n${emeraldHits.join("\n")}`,
  );
}

const driftHits = grepPortal("#4800a0");
if (driftHits.length) {
  failures.push(
    `Portal must not use #4800a0:\n${driftHits.join("\n")}`,
  );
}

if (failures.length) {
  console.error("Theme verification failed:\n");
  for (const msg of failures) console.error(`${msg}\n`);
  process.exit(1);
}

console.log("Theme guardrails passed.");
try {
  execSync("flutter analyze", {
    cwd: join(repoRoot, "viralcut-mobile"),
    stdio: "inherit",
  });
} catch {
  process.exit(1);
}
