"use client";

import { useMemo, useState } from "react";
import type { ContentNode } from "@spcx/content";

import { useLocale, useUiString } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { SourceRef } from "../SourceRef";

interface EndCreditsProps {
  authored: ContentNode[];
  caveat: ContentNode;
  glossary: ContentNode[];
}

export const EndCredits = ({ authored, caveat, glossary }: EndCreditsProps) => {
  const locale = useLocale();
  const title = useUiString("stage.title.10");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  // Glossary search matches against the term, the English definition,
  // and the Chinese definition when present, so a reader searching in
  // either language can find the entry.
  const filteredGlossary = useMemo(() => {
    if (!normalizedQuery) {
      return glossary;
    }

    return glossary.filter((node) => {
      const term = node.glossary?.term.toLowerCase() ?? "";
      const en = node.text.en.toLowerCase();
      const zh = node.text.zh?.toLowerCase() ?? "";

      return (
        term.includes(normalizedQuery) ||
        en.includes(normalizedQuery) ||
        zh.includes(normalizedQuery)
      );
    });
  }, [glossary, normalizedQuery]);
  const caveatDual = dualText(caveat, locale);

  return (
    <section id="stage-10" aria-labelledby="stage-10-title" className="min-h-screen px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
            Stage 10
          </p>
          <h2 id="stage-10-title" className="mt-4 text-4xl font-semibold">
            {title}
          </h2>
          <div className="mt-8 space-y-4 text-muted-white">
            {authored.map((node) => {
              const { primary, secondary } = dualText(node, locale);
              const renderLink = node.tags?.includes("github") ? (
                <a
                  className="text-body-white underline decoration-accent-teal underline-offset-4"
                  href="https://github.com/xdanger/spcx-s1.com"
                >
                  {primary}
                </a>
              ) : node.tags?.includes("contact") ? (
                <a
                  className="text-body-white underline decoration-accent-teal underline-offset-4"
                  href="mailto:y@dai.co"
                >
                  {primary}
                </a>
              ) : (
                primary
              );
              return (
                <p key={node.id}>
                  {renderLink}
                  {secondary ? (
                    <span lang="zh" className="mt-1 block text-muted-white/80">
                      {secondary}
                    </span>
                  ) : null}
                </p>
              );
            })}
          </div>

          <article className="mt-12 border-l border-accent-amber pl-5">
            <h3 className="text-xl font-semibold">Forward-Looking Statements</h3>
            <pre className="mt-4 whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
              {caveatDual.primary}
            </pre>
            {caveatDual.secondary ? (
              <pre
                lang="zh"
                className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80"
              >
                {caveatDual.secondary}
              </pre>
            ) : null}
            <SourceRef source={caveat.source} />
          </article>
        </div>

        <div>
          <label
            htmlFor="glossary-search"
            className="font-telemetry text-xs uppercase tracking-[0.16em] text-muted-white"
          >
            Glossary Search
          </label>
          <input
            id="glossary-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            className="mt-3 w-full border border-white/20 bg-space-black px-3 py-3 text-body-white"
            type="search"
            autoComplete="off"
          />
          <div className="mt-6 max-h-[70vh] space-y-5 overflow-auto pr-2">
            {filteredGlossary.map((node) => {
              const { primary, secondary } = dualText(node, locale);
              return (
                <article key={node.id} className="border-t border-white/15 pt-4">
                  <h3 className="text-lg font-semibold">{node.glossary?.term}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-white">{primary}</p>
                  {secondary ? (
                    <p
                      lang="zh"
                      className="mt-2 whitespace-pre-wrap border-l border-white/15 pl-3 text-sm text-muted-white/80"
                    >
                      {secondary}
                    </p>
                  ) : null}
                  <SourceRef source={node.source} />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
