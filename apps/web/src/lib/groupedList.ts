import { parseList, type ParsedListItem } from "./textHelpers";

export interface ParsedGroup {
  heading: string;
  items: ParsedListItem[];
}

// Headings in the S-1 growth-summary are short title-case section
// names: "Space", "Connectivity", "AI", "Future Markets". Cap length
// tightly and disallow commas so a wrapped bullet body like
// "Starship, enabling passengers..." can't pass.
const HEADING_PATTERN = /^[A-Z][A-Za-z &/()-]{0,29}$/;

const isHeadingShape = (line: string): boolean =>
  HEADING_PATTERN.test(line) && !line.endsWith(".") && !line.endsWith(":");

const parseBullet = (line: string): { marker: string; body: string } | null => {
  const match = /^\s*([-*•]|\d{1,2}\.)\s+(.*)$/.exec(line);
  if (!match) return null;
  return { marker: match[1], body: match[2].trim() };
};

const splitTitle = (body: string): { title: string | null; rest: string } => {
  const match = /^([^.]{2,80})\.\s+(.*)$/s.exec(body);
  if (!match) return { title: null, rest: body };
  return { title: match[1].trim(), rest: match[2].trim() };
};

const sanitize = (lines: string[]): string[] =>
  lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !/^\d{1,3}$/.test(trimmed);
  });

// A short capitalized line should only be treated as a heading when
// the next non-empty line is itself a bullet. Without this lookahead
// a bullet that wraps onto a short capitalized fragment (e.g.
// "Starship", "Power generation") gets misclassified as a new
// heading and the remainder of the wrapped bullet body is lost.
const nextNonEmptyIsBullet = (lines: string[], fromIndex: number): boolean => {
  for (let j = fromIndex; j < lines.length; j += 1) {
    const next = lines[j].trim();
    if (!next) continue;
    return parseBullet(lines[j]) !== null;
  }
  return false;
};

export const parseGroupedList = (text: string): ParsedGroup[] => {
  const lines = sanitize(text.split(/\r?\n/));
  const groups: ParsedGroup[] = [];
  let current: ParsedGroup | null = null;
  let pendingBullet: { marker: string; body: string } | null = null;

  const commitBullet = () => {
    if (!pendingBullet) return;
    // Bullets that appear before any heading land in an anonymous
    // group so they're not silently dropped. Without this, the
    // `current === null` early-return would lose data whenever the
    // source begins with bullets.
    if (!current) {
      current = { heading: "", items: [] };
      groups.push(current);
    }
    const { title, rest } = splitTitle(pendingBullet.body);
    current.items.push({
      marker: pendingBullet.marker,
      title,
      body: title ? rest : pendingBullet.body,
    });
    pendingBullet = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    const bullet = parseBullet(line);

    if (bullet) {
      commitBullet();
      pendingBullet = bullet;
      continue;
    }

    if (isHeadingShape(trimmed) && nextNonEmptyIsBullet(lines, i + 1)) {
      commitBullet();
      current = { heading: trimmed, items: [] };
      groups.push(current);
      continue;
    }

    if (pendingBullet) {
      pendingBullet.body = `${pendingBullet.body} ${trimmed}`;
    }
  }

  commitBullet();

  // If no bullets were ever found, fall back to the simpler parser so
  // callers still get some structure out of the input.
  if (groups.length === 0) {
    const flat = parseList(text);
    if (flat.items.length > 0) {
      return [{ heading: "", items: flat.items }];
    }
  }

  return groups.filter((g) => g.items.length > 0);
};
