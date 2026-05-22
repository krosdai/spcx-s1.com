"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText, primaryText } from "../../lib/localized";
import { parseList } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";

interface AlgorithmProps {
  nodes: ContentNode[];
}

export const Algorithm = ({ nodes }: AlgorithmProps) => {
  const locale = useLocale();
  const listNode = nodes.find(
    (node) => node.id === "stage4.algorithm.repeatable-business-model",
  );
  const quoteNode = nodes.find((node) => node.id === "stage4.algorithm.five-step");

  const parsed = listNode ? parseList(primaryText(listNode, locale)) : null;
  const quoteDual = quoteNode ? dualText(quoteNode, locale) : null;

  return (
    <StageSection id={4}>
      <div className="space-y-12">
        {parsed?.preamble ? (
          <p className="max-w-[68ch] text-base leading-7 text-muted-white">{parsed.preamble}</p>
        ) : null}

        {parsed?.items.length ? (
          <ol className="space-y-4">
            {parsed.items.map((item, index) => {
              const number = String(index + 1).padStart(2, "0");
              return (
                <li
                  key={number}
                  className="grid grid-cols-[4rem_1fr] items-start gap-4 border-l border-white/10 pl-5"
                >
                  <span className="font-telemetry text-xl tabular-nums text-accent-teal">
                    {number}
                  </span>
                  <p className="text-base leading-7 text-body-white">
                    {item.title ? `${item.title}. ${item.body}` : item.body}
                  </p>
                </li>
              );
            })}
          </ol>
        ) : null}

        {listNode ? <SourceRef source={listNode.source} /> : null}

        {quoteNode && quoteDual ? (
          <blockquote
            cite={quoteNode.source ? `#L${String(quoteNode.source.lineStart)}` : undefined}
            className="border-l-2 border-accent-amber bg-panel-black/40 p-6"
          >
            <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-amber">
              The Algorithm
            </p>
            <p className="mt-3 text-2xl font-semibold leading-snug text-body-white sm:text-3xl">
              {quoteDual.primary}
            </p>
            {quoteDual.secondary ? (
              <p
                lang="zh"
                className="mt-4 border-l border-white/15 pl-4 text-base leading-7 text-muted-white/80"
              >
                {quoteDual.secondary}
              </p>
            ) : null}
            <SourceRef source={quoteNode.source} />
          </blockquote>
        ) : null}
      </div>
    </StageSection>
  );
};
