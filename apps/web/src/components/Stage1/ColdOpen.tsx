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
// silently substituting a hardcoded author name. The strict regex
// requires a single em/en-dash followed by whitespace, which is what
// the English S-1 source uses.
const ATTRIBUTION_LEAD = /^[—–]\s+/;

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

// Lenient sibling for the Chinese translation. Chinese typography for
// attribution commonly uses a full-width double em-dash without a
// trailing space (`——艾隆·马斯克`), which the strict `splitQuote` regex
// rejects. We only need an attribution split for visual layout — there
// is no source-equality invariant to police, since the zh string is
// authored, not lifted from the S-1.
//
// Returns `{ body, attribution }` when the last line starts with one
// or more em/en-dashes (the universal "this is who said it" marker
// across the relevant scripts). Otherwise returns the whole string as
// the body so a translator whose attribution doesn't match either
// shape — or who omits the attribution entirely — still gets their
// translation rendered. The failure modes the previous `try/catch`
// silently swallowed are now visible: missing zh ⇒ no block at all,
// present zh ⇒ block always renders, just maybe without a separate
// footer.
const SECONDARY_ATTRIBUTION = /^[—–]+/;

const splitSecondaryQuote = (raw: string): { body: string; attribution: string } => {
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length >= 2) {
    const last = lines[lines.length - 1];
    if (SECONDARY_ATTRIBUTION.test(last)) {
      const body = lines.slice(0, -1).join(" ").replace(/\s+/g, " ").trim();
      return { body, attribution: last };
    }
  }

  return { body: raw.replace(/\s+/g, " ").trim(), attribution: "" };
};

export const ColdOpen = ({ nodes }: ColdOpenProps) => {
  // Hook must run before any conditional throw — React's Rules of Hooks
  // require an unconditional, fixed hook order per render even though
  // the throw practically unmounts the tree.
  const locale = useLocale();
  const muskQuote = nodes.find((node) => node.id === "stage1.cold-open.musk-quote");
  if (!muskQuote) {
    throw new Error("Stage 1: missing Musk quote content node");
  }

  const { primary, secondary } = dualText(muskQuote, locale);
  const { body, attribution } = splitQuote(primary);
  // Voice rule (docs/voice-and-visual.md): the Musk quote keeps its
  // English original in the Chinese locale and adds a translation
  // beneath. The lenient secondary parser always returns a body so a
  // present-but-unusual zh string still renders; the attribution is
  // optional and only set when the translator follows the dash-led
  // attribution shape (whether ` — Elon Musk` or `——艾隆·马斯克`).
  // Explicit empty-to-undefined conversion (rather than `|| undefined`)
  // so an empty body or attribution from the parser hides the slot
  // rather than rendering as an empty element. `??` won't substitute
  // because empty strings aren't nullish.
  const parsedSecondary = secondary ? splitSecondaryQuote(secondary) : null;
  const secondaryBody =
    parsedSecondary && parsedSecondary.body.length > 0 ? parsedSecondary.body : undefined;
  const secondaryAttribution =
    parsedSecondary && parsedSecondary.attribution.length > 0
      ? parsedSecondary.attribution
      : undefined;

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
