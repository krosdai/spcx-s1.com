"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "./useReducedMotion";

const MIN_CINEMATIC_WIDTH_QUERY = "(min-width: 768px)";

const detectWebGL = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
};

export const useCanCinematic = (): boolean => {
  const reducedMotion = useReducedMotion();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setCanRender(false);
      return;
    }

    const wide = window.matchMedia(MIN_CINEMATIC_WIDTH_QUERY);
    const update = () => {
      setCanRender(wide.matches && detectWebGL());
    };

    update();
    wide.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
    };
  }, [reducedMotion]);

  return canRender;
};
