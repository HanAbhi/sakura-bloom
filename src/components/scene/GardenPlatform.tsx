'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createStoneSandTextures } from '@/lib/textures';

interface GardenPlatformProps {
  growthProgress: number;
}

export function GardenPlatform({ growthProgress }: GardenPlatformProps) {
  const { sandMap, stoneMap } = useMemo(() => createStoneSandTextures(), []);

  // Naturally distributed river stones (Wabi-sabi layout)
  const stones = useMemo<Array<{
    pos: [number, number, number];
    scale: [number, number, number];
    rot: [number, number, number];
    color: string;
  }>>(() => {
    return [
      { pos: [2.8, -0.05, 1.2], scale: [0.55, 0.28, 0.45], rot: [0.1, 0.4, -0.05], color: '#6A6763' },
      { pos: [3.1, -0.08, 0.7], scale: [0.38, 0.22, 0.32], rot: [0.2, 0.9, 0.1], color: '#7E7A75' },
      { pos: [-2.6, -0.05, -1.8], scale: [0.65, 0.32, 0.52], rot: [-0.1, 1.2, 0.1], color: '#5C5854' },
      { pos: [-3.0, -0.08, -1.3], scale: [0.42, 0.25, 0.36], rot: [0.05, 0.3, -0.1], color: '#746F6B' },
      { pos: [-2.4, -0.07, 2.0], scale: [0.48, 0.26, 0.4], rot: [0.15, -0.7, 0.05], color: '#6B6661' },
      { pos: [1.8, -0.06, -2.5], scale: [0.58, 0.3, 0.44], rot: [-0.1, -0.4, 0.2], color: '#595551' },
    ];
  }, []);

  // Velvet moss mounds
  const mossPatches = useMemo(() => {
    return [
      { pos: [2.5, -0.08, 1.0], scale: [0.75, 0.12, 0.65] },
      { pos: [-2.3, -0.08, -1.6], scale: [0.85, 0.14, 0.75] },
      { pos: [-2.1, -0.08, 1.8], scale: [0.65, 0.11, 0.55] },
      { pos: [1.6, -0.08, -2.2], scale: [0.72, 0.13, 0.6] },
      { pos: [0.0, -0.09, 2.9], scale: [0.95, 0.14, 0.8] },
      { pos: [-2.9, -0.09, 0.2], scale: [0.8, 0.12, 0.7] },
    ];
  }, []);

  const sandRingGeo = useMemo(() => new THREE.RingGeometry(2.35, 3.8, 64), []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main outer Zen Sand ground plane with micro-grain texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          map={sandMap}
          color="#F5EFE8"
          roughness={0.92}
          metalness={0.01}
        />
      </mesh>

      {/* 2. Concentric Zen Raked Sand Rings (Karesansui water ripple pattern) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.115, 0]} receiveShadow>
        <primitive object={sandRingGeo} attach="geometry" />
        <meshStandardMaterial
          map={sandMap}
          color="#ECE4D8"
          roughness={0.86}
          metalness={0.01}
        />
      </mesh>

      {/* 3. Outer Stone Rim (Stepped Circular Platform with granite grain) */}
      <mesh position={[0, -0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 2.48, 0.1, 64]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#C2BAB2"
          roughness={0.76}
          metalness={0.04}
        />
      </mesh>

      {/* 4. Secondary Tier (Honed Granite Kerb) */}
      <mesh position={[0, -0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.22, 2.26, 0.08, 64]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#D4CCC3"
          roughness={0.70}
          metalness={0.04}
        />
      </mesh>

      {/* 5. Center Raised Plinth (Refined Warm Ivory Stone Surface for the Seed) */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[2.08, 2.1, 0.04, 64]} />
        <meshStandardMaterial
          map={stoneMap}
          color="#FCF8F3"
          roughness={0.52}
          metalness={0.02}
        />
      </mesh>

      {/* Subtle Inlaid Brass / Rose-Gold Accent Trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.031, 0]}>
        <ringGeometry args={[2.06, 2.08, 64]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.32}
          metalness={0.75}
        />
      </mesh>

      {/* 6. Sculptural River Stones with natural wabi-sabi sheen */}
      {stones.map((st, i) => (
        <mesh
          key={`stone-${i}`}
          position={st.pos}
          scale={st.scale}
          rotation={st.rot}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color={st.color}
            roughness={0.72}
            metalness={0.06}
          />
        </mesh>
      ))}

      {/* 7. Lush Velvet Moss Patches */}
      {mossPatches.map((moss, i) => (
        <mesh
          key={`moss-${i}`}
          position={moss.pos as [number, number, number]}
          scale={moss.scale as [number, number, number]}
          receiveShadow
        >
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#637257' : '#728365'}
            roughness={0.94}
            metalness={0.0}
          />
        </mesh>
      ))}

      {/* 8. Growth stage moss expansion around trunk base */}
      {growthProgress > 0.3 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]}>
          <ringGeometry args={[0, 0.95, 32]} />
          <meshStandardMaterial
            color="#546348"
            transparent
            opacity={Math.min(0.75, (growthProgress - 0.3) * 1.5)}
            roughness={0.92}
          />
        </mesh>
      )}
    </group>
  );
}
