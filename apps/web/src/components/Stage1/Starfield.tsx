"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface StarsProps {
  count: number;
}

const Stars = ({ count }: StarsProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      // Spherical shell distribution so depth has variation but the
      // camera at origin never sits on top of a star.
      const radius = 18 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Slight size variation, weighted small so the field feels sparse.
      sizes[i] = 0.6 + Math.pow(Math.random(), 4) * 1.6;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geom;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#ffffff"),
        size: 0.05,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    // Very slow drift; rotation rate chosen so a star crosses the
    // viewport over ~3 minutes — perceptible but never agitated.
    points.rotation.y += delta * 0.012;
    points.rotation.x += delta * 0.004;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

const ScrollDolly = () => {
  const { camera } = useThree();
  useFrame(() => {
    if (typeof window === "undefined") return;
    const scrollY = window.scrollY;
    // Map scroll to a small z offset so descending into the page
    // feels like easing forward through the field. Capped so the
    // camera never reaches the inner shell.
    const target = -Math.min(8, scrollY * 0.004);
    camera.position.z += (target - camera.position.z) * 0.04;
  });
  return null;
};

interface StarfieldProps {
  count?: number;
}

export const Starfield = ({ count = 900 }: StarfieldProps) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 0.1], fov: 60, near: 0.01, far: 200 }}
    >
      <Stars count={count} />
      <ScrollDolly />
    </Canvas>
  </div>
);
