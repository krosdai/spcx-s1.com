import type { ContentNode } from "@spcx/content";

import { cleanProse } from "../../lib/textHelpers";
import { parseGroupedList } from "../../lib/groupedList";
import { SourceRef } from "../SourceRef";
import { ClosingLine } from "./ClosingLine";
import { HorizonCinematic } from "./HorizonCinematic";

interface HorizonProps {
  nodes: ContentNode[];
}

export const Horizon = ({ nodes }: HorizonProps) => {
  const kardashev = nodes.find((node) => node.id === "stage9.horizon.kardashev-framing");
  const futureSummary = nodes.find(
    (node) => node.id === "stage9.horizon.future-markets-summary",
  );
  const lunar = nodes.find((node) => node.id === "stage9.horizon.lunar-economy");
  const futureDetail = nodes.find((node) => node.id === "stage9.horizon.future-markets-detail");
  const caveat = nodes.find((node) => node.id === "stage9.caveat.commercial-viability");
  const closing = nodes.find((node) => node.id === "stage9.horizon.closing-line");

  const futureSummaryGroup = futureSummary ? parseGroupedList(futureSummary.text.en) : [];
  const futureItems = futureSummaryGroup[0]?.items ?? [];

  return (
    <section
      id="stage-9"
      aria-labelledby="stage-9-title"
      className="relative isolate border-t border-white/5 bg-space-black px-6 py-28"
    >
      <HorizonCinematic />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
          Stage 09
        </p>
        <h2
          id="stage-9-title"
          className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl"
        >
          The Horizon
        </h2>

        <div className="mt-12 space-y-16">
          {kardashev ? (
            <article className="max-w-[68ch] space-y-4">
              <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-teal">
                Why this matters now — Kardashev Type II framing
              </p>
              <pre className="whitespace-pre-wrap font-body text-base leading-7 text-body-white">
                {cleanProse(kardashev.text.en)}
              </pre>
              <SourceRef source={kardashev.source} />
            </article>
          ) : null}

          {futureItems.length > 0 ? (
            <section aria-labelledby="stage-9-future-title" className="space-y-6">
              <h3
                id="stage-9-future-title"
                className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-amber"
              >
                Future markets
              </h3>
              <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {futureItems.map((item, idx) => (
                  <li
                    key={`fm-${String(idx)}`}
                    className="border border-white/10 bg-panel-black/60 p-4 text-sm leading-6 text-muted-white backdrop-blur-sm"
                  >
                    <span className="block text-body-white">{item.title ?? item.body}</span>
                    {item.title ? (
                      <span className="mt-2 block text-xs leading-5">{item.body}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {futureSummary ? <SourceRef source={futureSummary.source} /> : null}
            </section>
          ) : null}

          {lunar ? (
            <article className="max-w-[68ch] space-y-4">
              <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-blue">
                The lunar economy
              </p>
              <pre className="whitespace-pre-wrap font-body text-base leading-7 text-body-white">
                {cleanProse(lunar.text.en)}
              </pre>
              <SourceRef source={lunar.source} />
            </article>
          ) : null}

          {futureDetail ? (
            <details className="border border-white/10 bg-panel-black/60 backdrop-blur-sm">
              <summary className="cursor-pointer px-5 py-4 font-telemetry text-xs uppercase tracking-[0.16em] text-body-white hover:text-accent-amber">
                Read the full Future Markets section
              </summary>
              <div className="border-t border-white/10 px-5 py-5">
                <pre className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                  {cleanProse(futureDetail.text.en)}
                </pre>
                <SourceRef source={futureDetail.source} />
              </div>
            </details>
          ) : null}

          {caveat ? (
            <section
              aria-labelledby="stage-9-caveat-title"
              className="border-l-2 border-accent-amber bg-panel-black/60 p-6 backdrop-blur-sm"
            >
              <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-amber">
                Commercial viability — verbatim caveat (non-dismissible)
              </p>
              <h3
                id="stage-9-caveat-title"
                className="mt-3 text-2xl font-semibold text-body-white"
              >
                Timeline and commercial viability remain uncertain
              </h3>
              <pre className="mt-5 whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                {cleanProse(caveat.text.en)}
              </pre>
              <SourceRef source={caveat.source} />
            </section>
          ) : null}

          {closing ? (
            <div className="py-16">
              <ClosingLine text={closing.text.en.trim()} source={closing.source} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
