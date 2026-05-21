#!/usr/bin/env node
/**
 * Refresh the in-repo source manifest after an upstream S-1 amendment.
 *
 * Reads the snapshot at `sources/20260520_SpaceX_S-1_SEC-Filing.md`,
 * recomputes SHA-256 + line count, and rewrites the literals in
 * `src/manifest.ts`. The SOURCE_FILE constant and the surrounding
 * structure of the file are preserved.
 *
 * Usage:
 *   pnpm --filter @spcx/content refresh-manifest
 *
 * After running, re-run `pnpm --filter @spcx/content validate` and walk
 * through any errors (amended S-1s often shift line numbers).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { loadSource, SOURCE_PATH } from "../src/source";

const manifestPath = fileURLToPath(new URL("../src/manifest.ts", import.meta.url));
const loaded = loadSource(SOURCE_PATH);

const before = readFileSync(manifestPath, "utf8");

const SHA_RE = /sourceSha256:\s*"[0-9a-f]{64}"/u;
const COUNT_RE = /sourceLineCount:\s*\d+/u;

if (!SHA_RE.test(before) || !COUNT_RE.test(before)) {
  console.error(
    "[refresh-manifest] manifest.ts is missing the sourceSha256 or sourceLineCount field — refusing to rewrite.",
  );
  process.exit(1);
}

const updated = before
  .replace(SHA_RE, `sourceSha256: "${loaded.sha256}"`)
  .replace(COUNT_RE, `sourceLineCount: ${String(loaded.lines.length)}`);

if (updated !== before) writeFileSync(manifestPath, updated);
console.log(
  JSON.stringify(
    {
      ok: true,
      sourceFile: SOURCE_PATH,
      sourceSha256: loaded.sha256,
      sourceLineCount: loaded.lines.length,
    },
    null,
    2,
  ),
);
