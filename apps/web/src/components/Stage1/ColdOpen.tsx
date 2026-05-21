import type { ContentNode } from "@spcx/content";

import { ColdOpenInner } from "./ColdOpenInner";

interface ColdOpenProps {
  nodes: ContentNode[];
}

const splitQuote = (raw: string): { body: string; attribution: string } => {
  const lines = raw.trim().split(/\r?\n/);
  // Last source line is the attribution ("— Elon Musk"); everything
  // above is the running quote.
  const last = lines[lines.length - 1]?.trim() ?? "";
  const isAttribution = /^[—–-]\s*/.test(last);
  const attribution = isAttribution ? last : "— Elon Musk";
  const bodyLines = isAttribution ? lines.slice(0, -1) : lines;
  const body = bodyLines.join(" ").replace(/\s+/g, " ").trim();
  return { body, attribution };
};

export const ColdOpen = ({ nodes }: ColdOpenProps) => {
  const muskQuote = nodes.find((node) => node.id === "stage1.cold-open.musk-quote");
  if (!muskQuote) {
    throw new Error("Stage 1: missing Musk quote content node");
  }

  const { body, attribution } = splitQuote(muskQuote.text.en);

  return <ColdOpenInner body={body} attribution={attribution} source={muskQuote.source} />;
};
