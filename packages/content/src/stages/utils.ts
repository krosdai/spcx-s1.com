import type { ContentKind, ContentNode, RiskCategory, StageId } from "../schema";
import { sourceRef, textFromSource } from "../source";
import { getZh } from "../translations";

// Attaches `text.zh` from the translation registry when an entry exists.
// Returning a fresh `text` object keeps the original literal untouched.
const withZh = (id: string, en: string): ContentNode["text"] => {
  const zh = getZh(id);
  return zh === undefined ? { en } : { en, zh };
};

interface SourceNodeInput {
  id: string;
  stage: StageId;
  kind: ContentKind;
  lineStart: number;
  lineEnd?: number;
  sectionTitle?: string;
  tags?: string[];
  risk?: ContentNode["risk"];
  glossary?: ContentNode["glossary"];
  kpi?: ContentNode["kpi"];
  milestone?: ContentNode["milestone"];
}

export const sourceNode = ({
  id,
  stage,
  kind,
  lineStart,
  lineEnd = lineStart,
  sectionTitle,
  tags,
  risk,
  glossary,
  kpi,
  milestone,
}: SourceNodeInput): ContentNode => {
  const source = sourceRef(lineStart, lineEnd, sectionTitle);
  const en = textFromSource(source);

  return {
    id,
    stage,
    kind,
    text: withZh(id, en),
    verbatim: true,
    source,
    ...(tags ? { tags } : {}),
    ...(risk ? { risk } : {}),
    ...(glossary ? { glossary } : {}),
    ...(kpi ? { kpi } : {}),
    ...(milestone ? { milestone } : {}),
  };
};

export const authoredNode = (
  id: string,
  stage: 0 | 10,
  en: string,
  tags?: string[],
): ContentNode => ({
  id,
  stage,
  kind: "authored",
  text: withZh(id, en),
  verbatim: false,
  source: null,
  ...(tags ? { tags } : {}),
});

export const riskNode = (
  id: string,
  lineStart: number,
  lineEnd: number,
  category: RiskCategory,
  severity: NonNullable<ContentNode["risk"]>["severity"],
  tags?: string[],
  highlightedDisclosure = false,
): ContentNode =>
  sourceNode({
    id,
    stage: 7,
    kind: "risk",
    lineStart,
    lineEnd,
    sectionTitle: "Risk Factors",
    tags,
    risk: { category, severity, highlightedDisclosure },
  });

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
