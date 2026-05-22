"use client";

import dynamic from "next/dynamic";

import { useCanCinematic } from "../../hooks/useCanCinematic";
import { useSectionInView } from "../../hooks/useSectionInView";

const ForwardField = dynamic(
  () => import("./ForwardField").then((mod) => ({ default: mod.ForwardField })),
  { ssr: false },
);

export const RoadmapCinematic = () => {
  const cinematic = useCanCinematic();
  const sectionInView = useSectionInView("stage-5");
  if (!cinematic || !sectionInView) return null;

  // Sticky container pinned to the viewport while the reader scrolls
  // through Stage 5's content. Negative bottom margin removes the
  // sticky block from the flow so the content below it sits on top.
  // The canvas itself is unmounted when Stage 5 scrolls out of range
  // so its rAF loop and WebGL context don't tick for invisible work.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 -mb-[100vh] h-screen w-full"
    >
      <div className="relative h-full w-full">
        <ForwardField />
      </div>
    </div>
  );
};
