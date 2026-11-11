'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GardenPlatform } from './GardenPlatform';
import { SeedObject } from './SeedObject';
import { SakuraTree } from './SakuraTree';
import { PetalSystem } from './PetalSystem';
import { CameraController } from './CameraController';
import { SakuraStage } from '@/lib/animation';

interface SakuraSceneProps {
  stage: SakuraStage;
  globalProgress: number;
  activationProgress: number;
  germinationProgress: number;
  growthProgress: number;
  blossomProgress: number;
  blossomDensity: number;
  breezeIntensity: number;
  onTapGrow: () => void;
  reducedMotion?: boolean;
}

export function SakuraScene({
  stage,
  globalProgress,
  activationProgress,
  germinationProgress,
  growthProgress,
  blossomProgress,
  blossomDensity,
  breezeIntensity,
  onTapGrow,
  reducedMotion = false,
}: SakuraSceneProps) {
  // Guests are mostly on phones: cap the pixel ratio and use a modest shadow map
  const shadowSize = 1024;
  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 3.6, 3.2], fov: 45, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
      >
        {/* Soft, Natural Japanese Spring Atmosphere */}
        <color attach="background" args={['#F8F0EA']} />
        <fog attach="fog" args={['#F8F0EA', 8.0, 22.0]} />

        {/* Ambient & Natural Soft Spring Daylight */}
        <ambientLight intensity={0.78} color="#FFF9F4" />
        <hemisphereLight
          args={['#FFF0F4', '#EFE8DF', 0.58]}
          position={[0, 10, 0]}
        />

        {/* Primary Warm Spring Sunlight with Soft Contact Shadows */}
        <directionalLight
          position={[4.5, 9.5, 3.8]}
          intensity={1.55}
          color="#FFFDF8"
          castShadow
          shadow-mapSize-width={shadowSize}
          shadow-mapSize-height={shadowSize}
          shadow-camera-near={0.5}
          shadow-camera-far={26}
          shadow-camera-left={-4.5}
          shadow-camera-right={4.5}
          shadow-camera-top={4.5}
          shadow-camera-bottom={-4.5}
          shadow-bias={-0.00012}
          shadow-radius={2.5}
        />

        {/* Delicate Translucent Blossom Rim Backlight */}
        <directionalLight
          position={[-4.5, 6.5, -4.5]}
          intensity={0.75}
          color="#FFF5F7"
        />

        {/* Soft Pink Ground Bounce (Simulating light reflected through blossoms) */}
        <pointLight
          position={[0, 0.45, 0]}
          intensity={0.35}
          color="#EBA9B8"
          distance={4.8}
        />

        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* 1. Japanese Garden Platform & Zen Raked Sand */}
            <GardenPlatform growthProgress={growthProgress} />

            {/* 2. The Dormant Sakura Seed */}
            <SeedObject
              stage={stage}
              activationProgress={activationProgress}
              germinationProgress={germinationProgress}
              onTapGrow={onTapGrow}
              reducedMotion={reducedMotion}
            />

            {/* 3. The Living Botanically Detailed Sakura Tree */}
            <SakuraTree
              stage={stage}
              germinationProgress={germinationProgress}
              growthProgress={growthProgress}
              blossomProgress={blossomProgress}
              blossomDensity={blossomDensity}
              breezeIntensity={breezeIntensity}
            />

            {/* 4. Delicate 3-Layer Spatial Petal Simulation */}
            <PetalSystem
              stage={stage}
              breezeIntensity={breezeIntensity}
              blossomProgress={blossomProgress}
            />
          </group>

          {/* Smooth Camera Transition & Orbit Controls */}
          <CameraController stage={stage} globalProgress={globalProgress} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
