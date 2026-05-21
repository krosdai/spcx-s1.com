import { describe, expect, it } from "vitest";

import { allNodes, byStage, glossary } from "../src";
import { STAGE_IDS } from "../src/schema";

describe("content exports", () => {
  it("returns expected node counts per stage", () => {
    const counts = Object.fromEntries(STAGE_IDS.map((stage) => [stage, byStage(stage).length]));

    expect(counts).toEqual({
      0: 4,
      1: 1,
      2: 12,
      3: 9,
      4: 2,
      5: 5,
      6: 12,
      7: 14,
      8: 6,
      9: 6,
      10: 122,
    });
    expect(allNodes).toHaveLength(193);
    expect(glossary()).toHaveLength(117);
  });
});
