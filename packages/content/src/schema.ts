import { z } from "zod";

export const STAGE_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type StageId = (typeof STAGE_IDS)[number];

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const ContentKind = z.enum([
  "prose",
  "kpi",
  "milestone",
  "risk",
  "glossary",
  "quote",
  "table",
  "list",
  "caveat",
  "authored",
]);
export type ContentKind = z.infer<typeof ContentKind>;

export const RiskCategory = z.enum([
  "mission",
  "operational",
  "regulatory",
  "financial",
  "governance",
  "sector-ai",
]);
export type RiskCategory = z.infer<typeof RiskCategory>;

export const SourceRef = z
  .object({
    file: z.string().regex(/^sources\//, "source.file must live under sources/"),
    lineStart: z.number().int().positive(),
    lineEnd: z.number().int().positive(),
    sectionTitle: z.string().optional(),
  })
  .refine((s) => s.lineEnd >= s.lineStart, {
    message: "lineEnd must be >= lineStart",
  });
export type SourceRef = z.infer<typeof SourceRef>;

// Note: en is not enforced as non-empty here. The validator's rule 11 owns
// the empty-text check — keeping it in one place avoids duplicate errors
// (one as schema rule 1, one as validator rule 11) for the same violation.
export const LocalizedText = z.object({
  en: z.string(),
  zh: z.string().optional(),
});
export type LocalizedText = z.infer<typeof LocalizedText>;

const RiskMeta = z.object({
  category: RiskCategory,
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  highlightedDisclosure: z.boolean().optional(),
});

const GlossaryMeta = z.object({
  term: z.string().min(1),
});

const KpiMeta = z.object({
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  label: z.string().optional(),
  asOf: z.string().optional(),
});

const MilestoneMeta = z.object({
  year: z.number().int(),
  label: z.string().min(1),
});

const ContentNodeBase = z.object({
  id: z.string().regex(/^stage(0|1|2|3|4|5|6|7|8|9|10)\.[a-z0-9._-]+$/, {
    message: "id must be 'stageN.dot-separated-slug' (lowercase a-z0-9._-)",
  }),
  stage: z.number().int().min(0).max(10),
  kind: ContentKind,
  text: LocalizedText,
  verbatim: z.boolean(),
  originalText: z.string().optional(),
  source: SourceRef.nullable(),
  tags: z.array(z.string()).optional(),
  risk: RiskMeta.optional(),
  glossary: GlossaryMeta.optional(),
  kpi: KpiMeta.optional(),
  milestone: MilestoneMeta.optional(),
});

// Cross-field structural checks only. Semantic rules (5: originalText
// required for non-verbatim sourced nodes; 6: authored/source discipline;
// 11: non-empty English text) are enforced by the validator with explicit
// rule numbers — duplicating them here would produce two errors per
// violation.
export const ContentNode = ContentNodeBase.superRefine((node, ctx) => {
  const idStageMatch = /^stage(\d+)\./.exec(node.id);
  if (idStageMatch && Number(idStageMatch[1]) !== node.stage) {
    ctx.addIssue({
      code: "custom",
      path: ["stage"],
      message: `stage ${String(node.stage)} disagrees with id prefix '${idStageMatch[0]}' — keep \`stage\` and the id's \`stageN.\` prefix in sync`,
    });
  }
  if (node.kind === "risk" && !node.risk) {
    ctx.addIssue({
      code: "custom",
      message: "risk nodes must include `risk` metadata",
    });
  }
  if (node.kind === "glossary" && !node.glossary) {
    ctx.addIssue({
      code: "custom",
      message: "glossary nodes must include `glossary` metadata",
    });
  }
});
export type ContentNode = z.infer<typeof ContentNode>;

export const Manifest = z.object({
  sourceFile: z.string(),
  sourceSha256: z.string().length(64),
  generatedAt: z.string(),
  totals: z.object({
    nodes: z.number().int().nonnegative(),
    perStage: z.record(z.string(), z.number().int().nonnegative()),
  }),
});
export type Manifest = z.infer<typeof Manifest>;
