"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SourceRef as SourceRefType } from "@spcx/content";

import { useCanCinematic } from "../../hooks/useCanCinematic";
import { useSectionInView } from "../../hooks/useSectionInView";
import { SourceRef } from "../SourceRef";

const Starfield = dynamic(
  () => import("./Starfield").then((mod) => ({ default: mod.Starfield })),
  { ssr: false },
);

interface ColdOpenInnerProps {
  body: string;
  attribution: string;
  source: SourceRefType | null;
}

const TYPE_INTERVAL_MS = 24;
const TYPE_STEP = 2;
const TYPE_LEAD_DELAY_MS = 280;

export const ColdOpenInner = ({ body, attribution, source }: ColdOpenInnerProps) => {
  const cinematic = useCanCinematic();
  const sectionInView = useSectionInView("stage-1");
  const sectionRef = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState<string>(body);
  const [typing, setTyping] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!cinematic) {
      setTyped(body);
      setTyping(false);
      startedRef.current = false;
      return;
    }

    // Wait for the cold-open viewport intersection so the reveal is
    // synchronized with the reader arriving on Stage 1, not with
    // hydration. Until then leave the SSR text visible.
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setTyped(body);
      return;
    }

    // Lift timer + cancellation flag into the effect scope so the
    // outer cleanup can stop the recursive typewriter chain if the
    // component unmounts mid-type, or if `body` / `cinematic` change
    // and the effect re-runs.
    let timer: number | undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || startedRef.current || cancelled) continue;
          startedRef.current = true;
          observer.disconnect();

          setTyped("");
          setTyping(true);
          let index = 0;

          const tick = () => {
            if (cancelled) return;
            index = Math.min(body.length, index + TYPE_STEP);
            setTyped(body.slice(0, index));
            if (index < body.length) {
              timer = window.setTimeout(tick, TYPE_INTERVAL_MS);
            } else {
              setTyping(false);
            }
          };

          timer = window.setTimeout(tick, TYPE_LEAD_DELAY_MS);
        }
      },
      { threshold: 0.32 },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [body, cinematic]);

  return (
    <section
      ref={sectionRef}
      id="stage-1"
      aria-labelledby="stage-1-title"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-space-black px-6 py-32"
    >
      {cinematic && sectionInView ? <Starfield /> : null}
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
          Stage 01
        </p>
        <h2 id="stage-1-title" className="sr-only">
          Cold Open
        </h2>
        <blockquote className="mt-10">
          <p className="font-display text-2xl font-light leading-[1.55] text-body-white sm:text-3xl md:text-[2.05rem] md:leading-[1.5]">
            <span className="whitespace-pre-wrap">{typed}</span>
            {typing ? (
              <span
                aria-hidden="true"
                className="ml-[2px] inline-block h-[1.05em] w-[2px] -translate-y-[-0.12em] bg-body-white align-middle motion-safe:animate-pulse"
              />
            ) : null}
          </p>
          <footer className="mt-10 font-telemetry text-sm uppercase tracking-[0.28em] text-muted-white">
            {attribution}
          </footer>
        </blockquote>
        <div className="mt-8">
          <SourceRef source={source} />
        </div>
      </div>
    </section>
  );
};
