"use client";

import { useEffect, useState } from "react";

interface Options {
  rootMargin?: string;
}

// Returns true while the section with the given id is intersecting
// the viewport (within `rootMargin`). Used to mount the R3F canvases
// only when their stage is on or near the screen — keeping the rAF
// loop quiet and the WebGL context list short (Safari caps at ~16).
export const useSectionInView = (
  sectionId: string,
  { rootMargin = "200px 0px" }: Options = {},
): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") {
      // Environments without IO get the cinematic by default rather
      // than the static fallback — the goal is to avoid wasted work,
      // not to hide content.
      setInView(true);
      return;
    }

    const node = document.getElementById(sectionId);
    if (!node) {
      setInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [sectionId, rootMargin]);

  return inView;
};
