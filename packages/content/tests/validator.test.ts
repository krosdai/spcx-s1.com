import { describe, expect, it } from "vitest";

import { allNodes } from "../src";
import { sourceManifest } from "../src/manifest";
import type { ContentNode } from "../src/schema";
import { validateContent } from "../src/validator";

const cloneNodes = (): ContentNode[] => structuredClone(allNodes);

const expectRule = (nodes: unknown[], rule: number) => {
  const result = validateContent({ nodes });
  expect(result.errors.some((error) => error.rule === rule)).toBe(true);
};

const findSourcedIndex = (): number => {
  const idx = allNodes.findIndex((n) => n.source !== null && n.verbatim);
  if (idx === -1) throw new Error("No verbatim sourced node found");
  return idx;
};

const findTaggedIndex = (): number => {
  const tags = ["musk-quote", "highlighted-disclosure", "verbatim-required"];
  const idx = allNodes.findIndex(
    (n) => n.source !== null && n.verbatim && n.tags?.some((tag) => tags.includes(tag)),
  );
  if (idx === -1) throw new Error("No tagged verbatim sourced node found");
  return idx;
};

describe("validator rules", () => {
  it("passes the real content set", () => {
    const result = validateContent();

    expect(result.ok).toBe(true);
  });

  it("catches rule 1 schema violations", () => {
    expectRule([{ ...cloneNodes()[0], stage: 99 }], 1);
  });

  it("catches rule 2 duplicate IDs", () => {
    const nodes = cloneNodes();
    nodes.push({ ...nodes[0] });

    expectRule(nodes, 2);
  });

  it("catches rule 3 missing source ranges", () => {
    const nodes = cloneNodes();
    const idx = findSourcedIndex();
    const target = nodes[idx];
    if (!target.source) throw new Error(`expected sourced node at ${String(idx)}`);
    nodes[idx] = {
      ...target,
      source: { ...target.source, lineStart: 999999, lineEnd: 999999 },
    };

    expectRule(nodes, 3);
  });

  it("catches rule 4 verbatim mismatches", () => {
    const nodes = cloneNodes();
    const idx = findSourcedIndex();
    nodes[idx] = { ...nodes[idx], text: { en: "Not the S-1 text." } };

    expectRule(nodes, 4);
  });

  it("catches rule 5 missing originalText", () => {
    const nodes = cloneNodes();
    const idx = findSourcedIndex();
    nodes[idx] = { ...nodes[idx], verbatim: false };

    expectRule(nodes, 5);
  });

  it("catches rule 6 authored/source discipline", () => {
    const nodes = cloneNodes();
    nodes[0] = {
      ...nodes[0],
      source: {
        file: "sources/20260520_SpaceX_S-1_SEC-Filing.md",
        lineStart: 577,
        lineEnd: 580,
      },
    };

    expectRule(nodes, 6);
  });

  it("catches rule 7 tag/verbatim conflicts", () => {
    const nodes = cloneNodes();
    const idx = findTaggedIndex();
    nodes[idx] = {
      ...nodes[idx],
      verbatim: false,
      originalText: nodes[idx].text.en,
    };

    expectRule(nodes, 7);
  });

  it("catches rule 8 missing Forward-Looking caveat", () => {
    const nodes = cloneNodes().filter(
      (node) => node.id !== "stage10.caveat.forward-looking-statements",
    );

    expectRule(nodes, 8);
  });

  it("catches rule 9 missing Use of Proceeds and Dividend Policy", () => {
    const nodes = cloneNodes().filter(
      (node) =>
        node.id !== "stage6.financials.use-of-proceeds" &&
        node.id !== "stage6.financials.dividend-policy",
    );

    expectRule(nodes, 9);
  });

  it("catches rule 10 source hash drift", () => {
    const result = validateContent({
      manifest: { ...sourceManifest, sourceSha256: "0".repeat(64) },
    });

    expect(result.errors.some((error) => error.rule === 10)).toBe(true);
  });

  it("catches rule 11 empty English text", () => {
    const nodes = cloneNodes();
    const idx = findSourcedIndex();
    nodes[idx] = { ...nodes[idx], text: { en: "" } };

    expectRule(nodes, 11);
  });

  it("catches rule 12 missing zh in phase 4", () => {
    const result = validateContent({ phase: 4 });

    expect(result.errors.some((error) => error.rule === 12)).toBe(true);
  });

  it("does not flag rule 12 outside phase 4", () => {
    const result = validateContent();

    expect(result.errors.some((error) => error.rule === 12)).toBe(false);
  });

  it("catches rule 12 whitespace-only zh in phase 4", () => {
    const nodes = cloneNodes();
    const idx = findSourcedIndex();
    nodes[idx] = { ...nodes[idx], text: { en: nodes[idx].text.en, zh: "   " } };

    const result = validateContent({ nodes, phase: 4 });

    expect(result.errors.some((error) => error.rule === 12 && error.id === nodes[idx].id)).toBe(
      true,
    );
  });
});
