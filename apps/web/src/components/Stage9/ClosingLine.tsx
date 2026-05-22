"use client";

import { useEffect, useRef, useState } from "react";
import type { SourceRef as SourceRefType } from "@spcx/content";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { SourceRef } from "../SourceRef";

interface ClosingLineProps {
  text: string;
  source: SourceRefType | null;
}

const TYPE_INTERVAL_MS = 36;
const TYPE_STEP = 1;
const TYPE_LEAD_DELAY_MS = 180;

export const ClosingLine = ({ text, source }: ClosingLineProps) => {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(text);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setTyped(text);
      startedRef.current = false;
      return;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setTyped(text);
      return;
    }

    // Lift timer + cancellation flag into the effect scope so the
    // outer cleanup can stop the recursive typewriter chain if the
    // component unmounts mid-type, or if `text` / `reducedMotion`
    // change and the effect re-runs.
    let timer: number | undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || startedRef.current || cancelled) continue;
          startedRef.current = true;
          observer.disconnect();

          setTyped("");
          let index = 0;
          const tick = () => {
            if (cancelled) return;
            index = Math.min(text.length, index + TYPE_STEP);
            setTyped(text.slice(0, index));
            if (index < text.length) {
              timer = window.setTimeout(tick, TYPE_INTERVAL_MS);
            }
          };
          timer = window.setTimeout(tick, TYPE_LEAD_DELAY_MS);
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [reducedMotion, text]);

  return (
    <div ref={containerRef} className="relative">
      <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-teal">
        Closing transmission
      </p>
      <p className="mt-6 font-display text-3xl font-light leading-[1.35] text-body-white sm:text-4xl md:text-5xl">
        {typed}
      </p>
      <div className="mt-8">
        <SourceRef source={source} />
      </div>
    </div>
  );
};
