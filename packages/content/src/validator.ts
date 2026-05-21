import { existsSync } from "node:fs";

import { allNodes } from "./index";
import { sourceManifest, type SourceManifest } from "./manifest";
import { ContentNode, type ContentNode as ContentNodeType } from "./schema";
import { loadSource, normalizeWhitespace, SOURCE_PATH, textFromLines } from "./source";

export interface ValidationIssue {
  rule: number;
  id?: string;
  stage?: number;
  field: string;
  message: string;
  diff?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationWarning[];
  source: {
    path: string;
    lineCount: number;
    sha256: string;
    expectedSha256: string;
  };
}

export interface ValidateOptions {
  nodes?: unknown[];
  manifest?: SourceManifest;
  phase?: 1 | 4;
  sourcePath?: string;
}

const diff = (expected: string, actual: string): string =>
  [`--- source`, `+++ node`, `- ${expected}`, `+ ${actual}`].join("\n");

const issue = (
  rule: number,
  node: Partial<ContentNodeType> | undefined,
  field: string,
  message: string,
  extra?: Pick<ValidationIssue, "diff">,
): ValidationIssue => ({
  rule,
  ...(node?.id ? { id: node.id } : {}),
  ...(typeof node?.stage === "number" ? { stage: node.stage } : {}),
  field,
  message,
  ...(extra?.diff ? { diff: extra.diff } : {}),
});

export const validateContent = (options: ValidateOptions = {}): ValidationResult => {
  const manifest = options.manifest ?? sourceManifest;
  const sourcePath = options.sourcePath ?? SOURCE_PATH;
  const errors: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  let sourceLines: string[] = [];
  let source = {
    path: sourcePath,
    lineCount: 0,
    sha256: "",
    expectedSha256: manifest.sourceSha256,
  };

  if (!existsSync(sourcePath)) {
    errors.push({
      rule: 3,
      field: "source",
      message: `Source file does not exist: ${sourcePath}`,
    });
  } else {
    const loaded = loadSource(sourcePath);
    sourceLines = loaded.lines;
    source = {
      path: loaded.path,
      lineCount: loaded.lines.length,
      sha256: loaded.sha256,
      expectedSha256: manifest.sourceSha256,
    };
  }

  const inputNodes = options.nodes ?? allNodes;
  const parsedNodes: ContentNodeType[] = [];

  inputNodes.forEach((candidate, index) => {
    const rawNode =
      typeof candidate === "object" && candidate !== null
        ? (candidate as Partial<ContentNodeType>)
        : undefined;

    const parsed = ContentNode.safeParse(candidate);

    if (!parsed.success) {
      for (const zodIssue of parsed.error.issues) {
        errors.push(
          issue(
            1,
            rawNode,
            zodIssue.path.join(".") || `nodes.${String(index)}`,
            zodIssue.message,
          ),
        );
      }
      return;
    }

    parsedNodes.push(parsed.data);
  });

  const seenIds = new Map<string, ContentNodeType>();

  for (const node of parsedNodes) {
    const existing = seenIds.get(node.id);
    if (existing) {
      errors.push(
        issue(
          2,
          node,
          "id",
          `Duplicate id also used by stage ${String(existing.stage)}: ${node.id}`,
        ),
      );
    } else {
      seenIds.set(node.id, node);
    }

    if (node.source) {
      const { lineStart, lineEnd } = node.source;
      if (
        lineStart < 1 ||
        lineEnd < 1 ||
        lineStart > source.lineCount ||
        lineEnd > source.lineCount
      ) {
        errors.push(
          issue(
            3,
            node,
            "source",
            `Source range ${String(lineStart)}-${String(lineEnd)} is outside 1-${String(source.lineCount)}`,
          ),
        );
      }

      if (node.verbatim && lineStart <= source.lineCount && lineEnd <= source.lineCount) {
        const expected = normalizeWhitespace(textFromLines(sourceLines, lineStart, lineEnd));
        const actual = normalizeWhitespace(node.text.en);

        if (expected !== actual) {
          errors.push(
            issue(4, node, "text.en", "Verbatim text does not match source", {
              diff: diff(expected, actual),
            }),
          );
        }
      }
    }

    if (!node.verbatim && node.source && !node.originalText?.trim()) {
      errors.push(
        issue(5, node, "originalText", "Non-verbatim sourced nodes must include originalText"),
      );
    }

    if (node.kind === "authored" && node.source !== null) {
      errors.push(issue(6, node, "source", "Authored nodes must have source: null"));
    }

    if (node.kind !== "authored" && node.source === null) {
      errors.push(issue(6, node, "source", "Only authored nodes may have source: null"));
    }

    if (
      node.tags?.some((tag) =>
        ["musk-quote", "highlighted-disclosure", "verbatim-required"].includes(tag),
      ) &&
      !node.verbatim
    ) {
      errors.push(
        issue(
          7,
          node,
          "verbatim",
          "musk-quote, highlighted-disclosure, and verbatim-required tags require verbatim: true",
        ),
      );
    }

    if (!node.text.en.trim()) {
      errors.push(issue(11, node, "text.en", "English text is required"));
    }

    if (options.phase === 4 && node.text.zh === undefined) {
      errors.push(issue(12, node, "text.zh", "Chinese text key is required in Phase 4"));
    }
  }

  const forwardCaveat = parsedNodes.find(
    (node) =>
      node.stage === 10 &&
      node.source?.lineStart === 3502 &&
      node.tags?.includes("verbatim-required") &&
      node.verbatim,
  );
  if (!forwardCaveat) {
    errors.push({
      rule: 8,
      field: "stage10",
      message:
        "Stage 10 must include the verbatim Forward-Looking Statements caveat starting at line 3502",
    });
  }

  const useOfProceeds = parsedNodes.find(
    (node) =>
      node.stage === 6 &&
      node.source?.lineStart === 3575 &&
      node.source.lineEnd === 3601 &&
      node.verbatim,
  );
  if (!useOfProceeds) {
    errors.push({
      rule: 9,
      field: "stage6",
      message: "Stage 6 must include verbatim Use of Proceeds lines 3575-3601",
    });
  }

  const dividendPolicy = parsedNodes.find(
    (node) =>
      node.stage === 6 &&
      node.source?.lineStart === 3603 &&
      node.source.lineEnd === 3617 &&
      node.verbatim,
  );
  if (!dividendPolicy) {
    errors.push({
      rule: 9,
      field: "stage6",
      message: "Stage 6 must include verbatim Dividend Policy lines 3603-3617",
    });
  }

  if (source.sha256 && source.sha256 !== manifest.sourceSha256) {
    errors.push({
      rule: 10,
      field: "sourceSha256",
      message:
        "Source SHA-256 differs from manifest. Re-run pnpm --filter @spcx/content refresh-manifest and re-verify all content.",
    });
  }

  if (source.lineCount && source.lineCount !== manifest.sourceLineCount) {
    warnings.push({
      field: "sourceLineCount",
      message: `Source line count ${String(source.lineCount)} differs from manifest ${String(manifest.sourceLineCount)}`,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    source,
  };
};
