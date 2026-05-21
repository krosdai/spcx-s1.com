import type { ContentNode } from "@spcx/content";

import { parseList } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";

interface AlgorithmProps {
  nodes: ContentNode[];
}

export const Algorithm = ({ nodes }: AlgorithmProps) => {
  const listNode = nodes.find(
    (node) => node.id === "stage4.algorithm.repeatable-business-model",
  );
  const quoteNode = nodes.find((node) => node.id === "stage4.algorithm.five-step");

  const parsed = listNode ? parseList(listNode.text.en) : null;

  return (
    <StageSection id={4} title="The Algorithm">
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

        {quoteNode ? (
          <blockquote
            cite={quoteNode.source ? `#L${String(quoteNode.source.lineStart)}` : undefined}
            className="border-l-2 border-accent-amber bg-panel-black/40 p-6"
          >
            <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-amber">
              The Algorithm
            </p>
            <p className="mt-3 text-2xl font-semibold leading-snug text-body-white sm:text-3xl">
              {quoteNode.text.en}
            </p>
            <SourceRef source={quoteNode.source} />
          </blockquote>
        ) : null}
      </div>
    </StageSection>
  );
};
