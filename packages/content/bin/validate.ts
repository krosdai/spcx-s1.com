#!/usr/bin/env tsx

import { validateContent } from "../src/validator";

// Phase resolution order: --phase=N flag > CONTENT_PHASE env > default
// (phase 4). The zh registry now covers every node id, so the default
// gate enforces rule 12 (missing zh) as a hard error. Drop to phase 1
// with `--phase=1` only to debug zh-only failures in isolation.
const phaseFromArgs = (): 1 | 4 | undefined => {
  const flag = process.argv.find((arg) => arg.startsWith("--phase="));
  if (!flag) return undefined;
  const value = flag.slice("--phase=".length);
  if (value === "1") return 1;
  if (value === "4") return 4;
  throw new Error(`Unsupported --phase value: ${value} (expected 1 or 4)`);
};

const phaseFromEnv = (): 1 | 4 | undefined => {
  const value = process.env.CONTENT_PHASE;
  if (value === "1") return 1;
  if (value === "4") return 4;
  return undefined;
};

const phase: 1 | 4 = phaseFromArgs() ?? phaseFromEnv() ?? 4;

const result = validateContent({ phase });

if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
