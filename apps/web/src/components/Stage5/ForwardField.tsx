"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface ForwardStarsProps {
  count: number;
}

const RECYCLE_Z = 4;
const SPAWN_Z = -120;
const SPAN_XY = 32;

const ForwardStars = ({ count }: ForwardStarsProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * SPAN_XY;
      arr[i * 3 + 1] = (Math.random() - 0.5) * SPAN_XY;
      arr[i * 3 + 2] = SPAWN_Z + Math.random() * (RECYCLE_Z - SPAWN_Z);
    }
    return arr;
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#ffffff"),
        size: 0.05,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    // Slow forward drift along +Z. Recycle stars that pass the camera
    // back to the far plane with new XY scatter so the field stays
    // dense without growing in array length.
    const speed = 2.4 * delta;
    for (let i = 0; i < array.length; i += 3) {
      array[i + 2] += speed;
      if (array[i + 2] > RECYCLE_Z) {
        array[i] = (Math.random() - 0.5) * SPAN_XY;
        array[i + 1] = (Math.random() - 0.5) * SPAN_XY;
        array[i + 2] = SPAWN_Z;
      }
    }
    attr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

const VanishingHorizon = () => {
  const { camera } = useThree();
  useFrame(() => {
    if (typeof window === "undefined") return;
    const scrollY = window.scrollY;
    // Slight scroll-driven yaw so the trajectory feels like it bends
    // gently as the reader descends through Stage 5.
    const yaw = Math.sin(scrollY * 0.00035) * 0.06;
    camera.rotation.y += (yaw - camera.rotation.y) * 0.03;
  });
  return null;
};

interface ForwardFieldProps {
  count?: number;
}

export const ForwardField = ({ count = 1100 }: ForwardFieldProps) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 1], fov: 70, near: 0.01, far: 200 }}
    >
      <ForwardStars count={count} />
      <VanishingHorizon />
    </Canvas>
  </div>
);
