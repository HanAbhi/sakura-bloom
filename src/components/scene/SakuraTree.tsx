'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TreeGrowth, useTreeStructure } from './TreeGrowth';
import { BlossomSystem } from './BlossomSystem';
import { SakuraStage } from '@/lib/animation';

interface SakuraTreeProps {
  stage: SakuraStage;
  germinationProgress: number; // 0 to 1
  growthProgress: number; // 0 to 1
  blossomProgress: number; // 0 to 1
  blossomDensity: number;
  breezeIntensity: number;
}

export type TreeSway = { x: number; z: number };

export function SakuraTree({
  stage,
  germinationProgress,
  growthProgress,
  blossomProgress,
  blossomDensity,
  breezeIntensity,
}: SakuraTreeProps) {
  const { blossomPoints } = useTreeStructure();
  // Sway lives in a ref (not state) so the tree is not re-rendered every frame
  const treeSway = useRef<TreeSway>({ x: 0, z: 0 });

  // Harmonic spring wind simulation for the tree canopy
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Complex organic wind motion using dual sinusoidal frequencies
    const swayX =
      (Math.sin(time * 1.8) * 0.08 + Math.sin(time * 3.4) * 0.04) * breezeIntensity;
    const swayZ =
      (Math.cos(time * 1.5) * 0.07 + Math.cos(time * 2.8) * 0.03) * breezeIntensity;

    treeSway.current.x = swayX;
    treeSway.current.z = swayZ;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Trunk, Buttress Roots, and Fractal Branch Architecture */}
      <TreeGrowth
        germinationProgress={germinationProgress}
        growthProgress={growthProgress}
        breezeIntensity={breezeIntensity}
        treeSway={treeSway}
      />

      {/* 2. Delicate 5-Petal Yoshino Cherry Blossoms */}
      <BlossomSystem
        blossomPoints={blossomPoints}
        blossomProgress={blossomProgress}
        blossomDensity={blossomDensity}
        breezeIntensity={breezeIntensity}
        treeSway={treeSway}
      />
    </group>
  );
}

