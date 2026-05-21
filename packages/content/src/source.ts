import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { SourceRef } from "./schema";

export const SOURCE_FILE = "sources/20260520_SpaceX_S-1_SEC-Filing.md";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export const SOURCE_PATH = path.resolve(MODULE_DIR, "../../../", SOURCE_FILE);

export interface LoadedSource {
  path: string;
  text: string;
  lines: string[];
  sha256: string;
}

let cachedSource: LoadedSource | undefined;

export const splitLines = (text: string): string[] => {
  const lines = text.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
};

export const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();

export const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

export const loadSource = (sourcePath = SOURCE_PATH): LoadedSource => {
  if (sourcePath === SOURCE_PATH && cachedSource) {
    return cachedSource;
  }

  const text = readFileSync(sourcePath, "utf8");
  const loaded = {
    path: sourcePath,
    text,
    lines: splitLines(text),
    sha256: sha256(text),
  };

  if (sourcePath === SOURCE_PATH) {
    cachedSource = loaded;
  }

  return loaded;
};

export const textFromLines = (lines: string[], lineStart: number, lineEnd: number): string =>
  lines.slice(lineStart - 1, lineEnd).join("\n");

export const textFromSource = (source: SourceRef): string =>
  textFromLines(loadSource().lines, source.lineStart, source.lineEnd);

export const sourceRef = (
  lineStart: number,
  lineEnd = lineStart,
  sectionTitle?: string,
): SourceRef => ({
  file: SOURCE_FILE,
  lineStart,
  lineEnd,
  ...(sectionTitle ? { sectionTitle } : {}),
});
