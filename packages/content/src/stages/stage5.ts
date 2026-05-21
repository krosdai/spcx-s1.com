import { sourceNode } from "./utils";

export const stage5Nodes = [
  sourceNode({
    id: "stage5.roadmap.why-now",
    stage: 5,
    kind: "prose",
    lineStart: 715,
    lineEnd: 758,
    sectionTitle: "Why This Matters Now",
  }),
  sourceNode({
    id: "stage5.roadmap.growth-summary",
    stage: 5,
    kind: "list",
    lineStart: 1049,
    lineEnd: 1072,
    sectionTitle: "Our Growth Strategies",
  }),
  sourceNode({
    id: "stage5.roadmap.growth-detail",
    stage: 5,
    kind: "prose",
    lineStart: 7635,
    lineEnd: 7932,
    sectionTitle: "Business - Growth Strategies",
  }),
  sourceNode({
    id: "stage5.roadmap.future-markets",
    stage: 5,
    kind: "list",
    lineStart: 7938,
    lineEnd: 7962,
    sectionTitle: "Future Markets",
  }),
  sourceNode({
    id: "stage5.caveat.commercial-viability",
    stage: 5,
    kind: "caveat",
    lineStart: 1086,
    lineEnd: 1118,
    sectionTitle: "Our Challenges",
    tags: ["caveat:commercial-viability", "verbatim-required"],
  }),
];
