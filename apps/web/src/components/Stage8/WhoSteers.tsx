"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { cleanProse } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";

interface WhoSteersProps {
  nodes: ContentNode[];
}

interface BlockSpec {
  id: string;
  label: string;
  description?: string;
}

const BLOCK_ORDER: BlockSpec[] = [
  {
    id: "stage8.governance.founder",
    label: "Founder & controlled-company status",
    description:
      "Mr. Musk's roles inside and outside SpaceX, and what controlled-company status means.",
  },
  {
    id: "stage8.governance.dual-class",
    label: "Dual-class share structure",
    description:
      "Class A (one vote), Class B (ten votes), Class C (reclassified at IPO), Class D (authorized but unused).",
  },
  {
    id: "stage8.governance.texas-forum",
    label: "Texas reincorporation & forum selection",
    description: "Texas Business Court as the exclusive forum for internal-affairs disputes.",
  },
  {
    id: "stage8.governance.musk-dependency",
    label: "Musk-dependency risk factor",
  },
  {
    id: "stage8.governance.related-party-transactions",
    label: "Related-party transactions — summary",
  },
  {
    id: "stage8.governance.related-party-business-detail",
    label: "Related-party transactions — financial-statement notes",
  },
];

export const WhoSteers = ({ nodes }: WhoSteersProps) => {
  const locale = useLocale();
  const blocks = BLOCK_ORDER.map((spec) => ({
    spec,
    node: nodes.find((node) => node.id === spec.id),
  })).filter((entry): entry is { spec: BlockSpec; node: ContentNode } => Boolean(entry.node));

  return (
    <StageSection id={8}>
      <div className="space-y-8">
        {blocks.map(({ spec, node }, index) => {
          const { primary, secondary } = dualText(node, locale);
          return (
            <article
              key={spec.id}
              aria-labelledby={`${spec.id}-title`}
              className="border-l border-accent-blue/40 pl-6"
            >
              <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-blue">
                {String(index + 1).padStart(2, "0")} — {spec.label}
              </p>
              <h3
                id={`${spec.id}-title`}
                className="mt-3 text-2xl font-semibold text-body-white sm:text-3xl"
              >
                {spec.label}
              </h3>
              {spec.description ? (
                <p className="mt-3 max-w-[68ch] text-sm text-muted-white">{spec.description}</p>
              ) : null}
              <details className="group mt-5 border-t border-white/10 pt-5">
                <summary className="cursor-pointer font-telemetry text-xs uppercase tracking-[0.16em] text-muted-white hover:text-accent-blue">
                  Read the verbatim source
                </summary>
                <div className="mt-4">
                  <pre className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                    {cleanProse(primary)}
                  </pre>
                  {secondary ? (
                    <pre
                      lang="zh"
                      className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80"
                    >
                      {cleanProse(secondary)}
                    </pre>
                  ) : null}
                  <SourceRef source={node.source} />
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </StageSection>
  );
};
