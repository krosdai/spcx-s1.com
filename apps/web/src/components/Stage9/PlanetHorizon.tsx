"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PlanetSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.4, 4), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#b8bdb7"),
        wireframe: true,
        wireframeLinewidth: 1,
        transparent: true,
        opacity: 0.18,
      }),
    [],
  );

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Earth-like axial rotation, dialed slow so the silhouette
    // changes meaningfully over the section's read time.
    mesh.rotation.y += delta * 0.035;
    mesh.rotation.x = -0.32;
  });

  return (
    <mesh ref={meshRef} position={[0.5, -2.6, -2]} geometry={geometry} material={material} />
  );
};

const Stars = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 22 + Math.random() * 38;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#ffffff"),
        size: 0.04,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.y += delta * 0.008;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

export const PlanetHorizon = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 4.2], fov: 55, near: 0.01, far: 200 }}
    >
      <Stars />
      <PlanetSphere />
    </Canvas>
  </div>
);
