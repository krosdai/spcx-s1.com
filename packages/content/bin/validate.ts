#!/usr/bin/env tsx

import { validateContent } from "../src/validator";

// Phase resolution order: --phase=N flag > CONTENT_PHASE env > default
// (phase 1). Default stays at 1 until PR B fills the zh registry; once
// that lands, the build switches to --phase=4 and rule 12 becomes a
// hard error on the first missing translation.
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

const phase = phaseFromArgs() ?? phaseFromEnv();

const result = validateContent(phase === undefined ? {} : { phase });

if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
