export * from "./schema";
export { manifest, sourceManifest } from "./manifest";
export { SOURCE_FILE, normalizeWhitespace } from "./source";
export { getZh, missingZhIds, zhTranslations } from "./translations";

import type { ContentNode, StageId } from "./schema";
import { stage0Nodes } from "./stages/stage0";
import { stage10Nodes } from "./stages/stage10";
import { stage1Nodes } from "./stages/stage1";
import { stage2Nodes } from "./stages/stage2";
import { stage3Nodes } from "./stages/stage3";
import { stage4Nodes } from "./stages/stage4";
import { stage5Nodes } from "./stages/stage5";
import { stage6Nodes } from "./stages/stage6";
import { stage7Nodes } from "./stages/stage7";
import { stage8Nodes } from "./stages/stage8";
import { stage9Nodes } from "./stages/stage9";

export const allNodes: ContentNode[] = [
  ...stage0Nodes,
  ...stage1Nodes,
  ...stage2Nodes,
  ...stage3Nodes,
  ...stage4Nodes,
  ...stage5Nodes,
  ...stage6Nodes,
  ...stage7Nodes,
  ...stage8Nodes,
  ...stage9Nodes,
  ...stage10Nodes,
];

export const byStage = (stage: StageId): ContentNode[] =>
  allNodes.filter((node) => node.stage === stage);

export const glossary = (): ContentNode[] =>
  allNodes.filter((node) => node.kind === "glossary");

export const byTag = (tag: string): ContentNode[] =>
  allNodes.filter((node) => node.tags?.includes(tag));
