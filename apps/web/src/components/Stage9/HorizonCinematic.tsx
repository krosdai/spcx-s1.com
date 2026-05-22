"use client";

import dynamic from "next/dynamic";

import { useCanCinematic } from "../../hooks/useCanCinematic";
import { useSectionInView } from "../../hooks/useSectionInView";

const PlanetHorizon = dynamic(
  () => import("./PlanetHorizon").then((mod) => ({ default: mod.PlanetHorizon })),
  { ssr: false },
);

export const HorizonCinematic = () => {
  const cinematic = useCanCinematic();
  const sectionInView = useSectionInView("stage-9");
  if (!cinematic || !sectionInView) return null;

  // Sticky backdrop pinned through Stage 9. Unmounted when the
  // section scrolls out of range so the rAF loop and WebGL context
  // don't tick for an invisible scene.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 -mb-[100vh] h-screen w-full"
    >
      <div className="relative h-full w-full">
        <PlanetHorizon />
      </div>
    </div>
  );
};
