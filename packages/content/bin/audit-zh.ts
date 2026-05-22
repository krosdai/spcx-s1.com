#!/usr/bin/env tsx

import { allNodes, getZh } from "../src/index";

// Audits the Chinese translation coverage of the content layer. Prints a
// per-stage tally, the percentage covered, and (unless --quiet) the id +
// English preview of every node still missing a zh entry. Useful when
// translating in batches — run it after editing the registry to see
// what's left.
const QUIET = process.argv.includes("--quiet");
const PREVIEW_LIMIT = 80;

interface StageStat {
  stage: number;
  total: number;
  translated: number;
  missing: { id: string; preview: string }[];
}

const stats = new Map<number, StageStat>();

for (const node of allNodes) {
  let stat = stats.get(node.stage);
  if (!stat) {
    stat = { stage: node.stage, total: 0, translated: 0, missing: [] };
    stats.set(node.stage, stat);
  }
  stat.total += 1;

  if (getZh(node.id) !== undefined) {
    stat.translated += 1;
  } else {
    const preview = node.text.en.replace(/\s+/g, " ").trim().slice(0, PREVIEW_LIMIT);
    stat.missing.push({ id: node.id, preview });
  }
}

const sorted = [...stats.values()].sort((a, b) => a.stage - b.stage);
const totalNodes = allNodes.length;
const translated = sorted.reduce((sum, stat) => sum + stat.translated, 0);
const missing = totalNodes - translated;
const pct = totalNodes === 0 ? "100.0" : ((translated / totalNodes) * 100).toFixed(1);

console.log(
  `zh coverage: ${String(translated)}/${String(totalNodes)} (${pct}%) — ${String(missing)} missing`,
);
console.log("");
console.log("stage | translated / total");
console.log("------+------------------");
for (const stat of sorted) {
  const label = `${String(stat.stage).padStart(5)} | ${String(stat.translated).padStart(10)} / ${String(stat.total).padStart(5)}`;
  console.log(label);
}

if (QUIET || missing === 0) {
  process.exit(missing === 0 ? 0 : 1);
}

console.log("");
console.log("Missing entries:");
for (const stat of sorted) {
  if (stat.missing.length === 0) continue;
  console.log("");
  console.log(`# stage ${String(stat.stage)} (${String(stat.missing.length)} missing)`);
  for (const entry of stat.missing) {
    console.log(`  ${entry.id}: ${entry.preview}`);
  }
}

process.exit(missing === 0 ? 0 : 1);
