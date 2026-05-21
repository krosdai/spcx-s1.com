import { parseList, type ParsedListItem } from "./textHelpers";

export interface ParsedGroup {
  heading: string;
  items: ParsedListItem[];
}

const HEADING_PATTERN = /^[A-Z][A-Za-z ()/&,-]{1,60}$/;

const isHeading = (line: string): boolean =>
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

export const parseGroupedList = (text: string): ParsedGroup[] => {
  const lines = sanitize(text.split(/\r?\n/));
  const groups: ParsedGroup[] = [];
  let current: ParsedGroup | null = null;
  let pendingBullet: { marker: string; body: string } | null = null;

  const commitBullet = () => {
    if (!pendingBullet || !current) {
      pendingBullet = null;
      return;
    }
    const { title, rest } = splitTitle(pendingBullet.body);
    current.items.push({
      marker: pendingBullet.marker,
      title,
      body: title ? rest : pendingBullet.body,
    });
    pendingBullet = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const bullet = parseBullet(line);

    if (bullet) {
      commitBullet();
      pendingBullet = bullet;
      continue;
    }

    if (isHeading(trimmed)) {
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

  // If no headings were found, fall back to a single anonymous group
  // using the simpler parser.
  if (groups.length === 0) {
    const flat = parseList(text);
    if (flat.items.length > 0) {
      return [{ heading: "", items: flat.items }];
    }
  }

  return groups.filter((g) => g.items.length > 0);
};
