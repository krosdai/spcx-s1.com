import type { ContentNode } from "@spcx/content";

export interface ParsedListItem {
  marker: string;
  title: string | null;
  body: string;
}

export interface ParsedList {
  preamble: string;
  items: ParsedListItem[];
}

const BULLET_PATTERN = /^\s*(?<marker>[-*•]|\d{1,2}\.)\s+(?<body>.*)$/;
const PAGE_ARTIFACT_PATTERN = /^\d{1,3}$/;
// Title separator: ASCII period + space (en source convention) or
// full-width Chinese period (`。`), which traditionally has no
// trailing space. Accepting both keeps the eyebrow/body split
// working in Stage 3 / Stage 8 cards after zh translations land.
// The ZH regex uses `\s*` because zh typography omits the trailing
// space — splitTitle below then bails when `rest` is empty so a
// single sentence terminated by `。` is treated as body, not a
// title with an empty body (which Algorithm.tsx would render as
// `title. ` with a spurious English period).
const TITLE_SPLIT_EN = /^([^.]{2,80})\.\s+(.*)$/s;
const TITLE_SPLIT_ZH = /^([^。]{2,80})。\s*(.*)$/s;

const splitTitle = (body: string): { title: string | null; rest: string } => {
  const match = TITLE_SPLIT_EN.exec(body) ?? TITLE_SPLIT_ZH.exec(body);
  if (!match) return { title: null, rest: body };
  const rest = match[2].trim();
  if (rest.length === 0) return { title: null, rest: body };
  return { title: match[1].trim(), rest };
};

const sanitize = (lines: string[]): string[] =>
  lines.filter((line) => !PAGE_ARTIFACT_PATTERN.test(line.trim()));

export const parseList = (text: string): ParsedList => {
  const lines = sanitize(text.split(/\r?\n/));
  const preambleLines: string[] = [];
  const items: ParsedListItem[] = [];
  let current: { marker: string; body: string } | null = null;

  const commit = () => {
    if (!current) return;
    const { title, rest } = splitTitle(current.body);
    items.push({ marker: current.marker, title, body: title ? rest : current.body });
    current = null;
  };

  for (const line of lines) {
    const match = BULLET_PATTERN.exec(line);
    if (match?.groups) {
      commit();
      current = { marker: match.groups.marker, body: match.groups.body.trim() };
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    if (current) {
      current.body = `${current.body} ${trimmed}`;
    } else {
      preambleLines.push(trimmed);
    }
  }

  commit();
  return { preamble: preambleLines.join(" "), items };
};

export const parseListItems = (text: string): ParsedListItem[] => parseList(text).items;

export const cleanProse = (text: string): string => sanitize(text.split(/\r?\n/)).join("\n");

// `reflowProse` is the right transformer for paragraph-style prose
// nodes whose source is the S-1 PDF — that file wraps every paragraph
// at ~110 characters, so a naive render with `whitespace-pre-wrap`
// produces visible hard breaks mid-sentence. `reflowProse` collapses
// single newlines into spaces (the S-1's intra-paragraph line breaks
// are typographical, not semantic) while preserving paragraph breaks
// (`\n\n+`). Trailing / leading whitespace per paragraph is trimmed.
// Use the rendered output with normal HTML wrapping — do not pair it
// with `whitespace-pre-wrap` or the spaces will collapse oddly.
export const reflowProse = (text: string): string =>
  // Run the same `sanitize` filter as `cleanProse` first so isolated
  // SEC page-number lines (e.g. "4" between paragraphs of the why-now
  // copy, "16" inside the Stage 7 risk summary range) drop out
  // instead of becoming visible standalone paragraphs after the
  // reflow.
  sanitize(text.split(/\r?\n/))
    .join("\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0)
    .join("\n\n");

// Split a reflowed prose string into discrete paragraphs (the `\n\n`
// breakpoints that `reflowProse` preserves). Lets a renderer emit
// multiple `<p>` elements instead of relying on `whitespace-pre-wrap`
// to coerce newlines into visible breaks.
export const splitReflowedParagraphs = (text: string): string[] =>
  reflowProse(text)
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.length > 0);

export const localized = (node: ContentNode, locale: "en" | "zh"): string => {
  const candidate = node.text[locale];
  return candidate && candidate.length > 0 ? candidate : node.text.en;
};

export interface NumericValue {
  target: number;
  decimals: number;
  hasCurrency: boolean;
  finance: "positive" | "negative-paren" | "negative-sign";
}

export const parseNumericValue = (raw: string | number): NumericValue | null => {
  if (typeof raw === "number") {
    return {
      target: raw,
      decimals: 0,
      hasCurrency: false,
      finance: raw < 0 ? "negative-sign" : "positive",
    };
  }

  const trimmed = raw.trim();
  const parenNegative = /^\(.*\)$/.test(trimmed);
  const signNegative = !parenNegative && trimmed.startsWith("-");
  const stripped = trimmed
    .replace(/[(),$]/g, "")
    .replace(/^\+/, "")
    .replace(/^-/, "")
    .trim();

  const magnitude = Number(stripped);
  if (!Number.isFinite(magnitude)) return null;

  const target = parenNegative || signNegative ? -magnitude : magnitude;
  const dot = stripped.indexOf(".");
  const decimals = dot >= 0 ? stripped.length - dot - 1 : 0;
  const finance: NumericValue["finance"] = parenNegative
    ? "negative-paren"
    : signNegative
      ? "negative-sign"
      : "positive";

  return { target, decimals, hasCurrency: trimmed.includes("$"), finance };
};

export const formatNumber = (value: number, decimals: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export const formatNumericValue = (value: number, template: NumericValue): string => {
  const magnitude = Math.abs(value);
  const formatted = formatNumber(magnitude, template.decimals);
  const withCurrency = template.hasCurrency ? `$${formatted}` : formatted;
  if (value < 0 && template.finance === "negative-paren") return `(${withCurrency})`;
  if (value < 0) return `-${withCurrency}`;
  return withCurrency;
};
