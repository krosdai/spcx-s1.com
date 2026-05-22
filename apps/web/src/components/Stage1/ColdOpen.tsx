"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";

import { ColdOpenInner } from "./ColdOpenInner";

interface ColdOpenProps {
  nodes: ContentNode[];
}

// The Stage 1 source range (l.577–580) ends with the attribution line
// "— Elon Musk". `splitQuote` separates that from the running body and
// throws if the shape changes — mirroring the missing-node invariant
// below so content drift fails loud at build/render time instead of
// silently substituting a hardcoded author name.
const ATTRIBUTION_LEAD = /^[—–]\s+/; // em-dash or en-dash + space

const splitQuote = (raw: string): { body: string; attribution: string } => {
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error(
      "Stage 1: Musk quote source must have at least two lines (body + attribution)",
    );
  }

  const last = lines[lines.length - 1];
  if (!ATTRIBUTION_LEAD.test(last)) {
    throw new Error(
      `Stage 1: Musk quote attribution line must start with an em-dash, got: ${JSON.stringify(last)}`,
    );
  }

  const body = lines.slice(0, -1).join(" ").replace(/\s+/g, " ").trim();
  return { body, attribution: last };
};

export const ColdOpen = ({ nodes }: ColdOpenProps) => {
  const muskQuote = nodes.find((node) => node.id === "stage1.cold-open.musk-quote");
  if (!muskQuote) {
    throw new Error("Stage 1: missing Musk quote content node");
  }

  const locale = useLocale();
  const { primary, secondary } = dualText(muskQuote, locale);
  const { body, attribution } = splitQuote(primary);
  // Voice rule (docs/voice-and-visual.md): the Musk quote keeps its
  // English original in the Chinese locale and adds a translation
  // beneath. Only run the parser on `secondary` when the translator
  // preserved the body + em-dash attribution shape — otherwise we drop
  // the bilingual block silently rather than throwing on render.
  let secondaryBody: string | undefined;
  let secondaryAttribution: string | undefined;
  if (secondary) {
    try {
      const parsed = splitQuote(secondary);
      secondaryBody = parsed.body;
      secondaryAttribution = parsed.attribution;
    } catch {
      secondaryBody = undefined;
      secondaryAttribution = undefined;
    }
  }

  return (
    <ColdOpenInner
      body={body}
      attribution={attribution}
      secondaryBody={secondaryBody}
      secondaryAttribution={secondaryAttribution}
      source={muskQuote.source}
    />
  );
};
