import type { ContentNode } from "@spcx/content";

import { cleanProse, parseList } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";

interface ThreePillarsProps {
  nodes: ContentNode[];
}

interface Pillar {
  marker: string;
  name: string;
  summary?: ContentNode;
  detail?: ContentNode;
  extras: ContentNode[];
}

const PILLAR_DEFINITIONS: { marker: string; name: string; idPrefix: string }[] = [
  { marker: "01", name: "Space", idPrefix: "stage3.space" },
  { marker: "02", name: "Connectivity", idPrefix: "stage3.connectivity" },
  { marker: "03", name: "AI", idPrefix: "stage3.ai" },
];

const buildPillar = (
  nodes: ContentNode[],
  idPrefix: string,
): Pick<Pillar, "summary" | "detail" | "extras"> => {
  const pillarNodes = nodes.filter((node) => node.id.startsWith(`${idPrefix}.`));
  // The cards-grid lives on the bullet list — pick the first `kind: 'list'`
  // node. Space ships a separate `stage3.space.summary` prose intro
  // that would have matched a name-based predicate and pushed the
  // actual `stage3.space.vehicles` list into `extras`.
  const summary = pillarNodes.find((node) => node.kind === "list");
  const detail = pillarNodes.find((node) => node.id.endsWith(".business-detail"));
  const extras = pillarNodes.filter((node) => node !== summary && node !== detail);
  return { summary, detail, extras };
};

export const ThreePillars = ({ nodes }: ThreePillarsProps) => {
  const pillars: Pillar[] = PILLAR_DEFINITIONS.map((def) => ({
    ...def,
    ...buildPillar(nodes, def.idPrefix),
  }));

  return (
    <StageSection id={3} title="The Three Pillars">
      <div className="space-y-20">
        {pillars.map((pillar) => {
          const parsedList = pillar.summary ? parseList(pillar.summary.text.en) : null;

          return (
            <article
              key={pillar.marker}
              aria-labelledby={`pillar-${pillar.marker}-title`}
              className="border-l border-accent-teal/40 pl-6"
            >
              <header className="flex items-baseline gap-4">
                <span className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
                  Pillar {pillar.marker}
                </span>
                <h3
                  id={`pillar-${pillar.marker}-title`}
                  className="text-3xl font-semibold text-body-white"
                >
                  {pillar.name}
                </h3>
              </header>

              {parsedList?.preamble ? (
                <p className="mt-6 max-w-[68ch] text-muted-white">{parsedList.preamble}</p>
              ) : null}

              {parsedList?.items.length ? (
                <ul className="mt-8 grid gap-4 md:grid-cols-2">
                  {parsedList.items.map((item, index) => (
                    <li
                      key={`${pillar.marker}-${String(index)}`}
                      className="border border-white/10 bg-panel-black/60 p-5"
                    >
                      {item.title ? (
                        <p className="font-telemetry text-[11px] uppercase tracking-[0.16em] text-accent-teal">
                          {item.title}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm leading-6 text-body-white">{item.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {pillar.summary ? <SourceRef source={pillar.summary.source} /> : null}

              {pillar.detail ? (
                <details className="group mt-8 border-t border-white/10 pt-6">
                  <summary className="cursor-pointer font-telemetry text-xs uppercase tracking-[0.16em] text-muted-white hover:text-body-white">
                    Full Business detail
                  </summary>
                  <div className="mt-4 space-y-3">
                    <p className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                      {cleanProse(pillar.detail.text.en)}
                    </p>
                    <SourceRef source={pillar.detail.source} />
                  </div>
                </details>
              ) : null}

              {pillar.extras.length > 0 ? (
                <div className="mt-8 space-y-6">
                  {pillar.extras.map((extra) => (
                    <details key={extra.id} className="border-t border-white/10 pt-6">
                      <summary className="cursor-pointer font-telemetry text-xs uppercase tracking-[0.16em] text-muted-white hover:text-body-white">
                        {extra.source?.sectionTitle ?? "Additional detail"}
                      </summary>
                      <div className="mt-4 space-y-3">
                        <p className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                          {cleanProse(extra.text.en)}
                        </p>
                        <SourceRef source={extra.source} />
                      </div>
                    </details>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </StageSection>
  );
};
