'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SakuraStage } from '@/lib/animation';

interface SeedObjectProps {
  stage: SakuraStage;
  activationProgress: number; // 0 to 1
  germinationProgress: number; // 0 to 1
  onTapGrow: () => void;
  reducedMotion?: boolean;
}

const PARTICLE_COUNT = 1200;
const GATHER_RADIUS = 1.15;

/**
 * The dormant sakura seed resting on the garden plinth. On awakening, a swirl of
 * glowing sakura energy gathers from across the plinth into the seed before it sprouts.
 */
export function SeedObject({
  stage,
  activationProgress,
  germinationProgress,
  onTapGrow,
  reducedMotion = false,
}: SeedObjectProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const seedRef = useRef<THREE.Group>(null);

  // Particles start scattered across the plinth surface, denser toward the centre
  const { particlePositions, particleOrigins } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const origins = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.sqrt(Math.random()) * GATHER_RADIUS;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      origins[i * 3 + 0] = positions[i * 3 + 0] = x;
      origins[i * 3 + 1] = positions[i * 3 + 1] = 0.04;
      origins[i * 3 + 2] = positions[i * 3 + 2] = z;
    }
    return { particlePositions: positions, particleOrigins: origins };
  }, []);

  const isIdle = stage === SakuraStage.SEED;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Gathering particle swirl
    if (particlesRef.current) {
      if (activationProgress > 0.01 && activationProgress < 0.99) {
        particlesRef.current.visible = true;
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const p = activationProgress;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ox = particleOrigins[i * 3 + 0];
          const oy = particleOrigins[i * 3 + 1];
          const oz = particleOrigins[i * 3 + 2];
          const radius = Math.sqrt(ox * ox + oz * oz) * (1 - p);
          const angle = Math.atan2(oz, ox) + p * 6.0 + i * 0.01;
          posAttr.setXYZ(
            i,
            Math.cos(angle) * radius,
            oy + Math.sin(p * Math.PI) * (0.35 + (i % 10) * 0.04),
            Math.sin(angle) * radius
          );
        }
        posAttr.needsUpdate = true;
      } else {
        particlesRef.current.visible = false;
      }
    }

    // 2. Glowing seed
    if (seedRef.current) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.08;
      let seedScale = pulse;
      let seedY = 0.045;

      if (isIdle) {
        seedScale = pulse * 0.72;
      } else if (activationProgress > 0 && germinationProgress === 0) {
        seedScale = pulse * (1 + activationProgress * 1.5);
      } else if (germinationProgress > 0) {
        seedScale = Math.max(0, (1 - germinationProgress) * 2.2);
        seedY = 0.045 - germinationProgress * 0.05;
      }

      seedRef.current.visible = seedScale > 0.001;
      seedRef.current.position.y = seedY;
      seedRef.current.scale.setScalar(seedScale);
    }
  });

  const setCursor = (pointer: boolean) => {
    document.body.style.cursor = pointer && isIdle ? 'pointer' : 'auto';
  };

  return (
    <group>
      {/* Invisible tap target over the plinth so the seed is easy to hit on a phone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.036, 0]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          if (isIdle) onTapGrow();
        }}
        onPointerOver={() => setCursor(true)}
        onPointerOut={() => setCursor(false)}
      >
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial />
      </mesh>

      {/* Gathering sakura energy */}
      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#F7D7DE"
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Dormant / awakening sakura seed */}
      <group ref={seedRef} position={[0, 0.045, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#EBA9B8"
            emissive="#EBA9B8"
            emissiveIntensity={0.7 + activationProgress * 2.0}
            roughness={0.2}
          />
        </mesh>

        {/* Golden bud halo */}
        <mesh scale={[1.25, 1.25, 1.25]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial
            color="#FFF2E0"
            transparent
            opacity={0.35 + activationProgress * 0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Four tiny sprouting petal leaves */}
        {[0, 1, 2, 3].map((idx) => {
          const rotAngle = (idx * Math.PI) / 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(rotAngle) * 0.05, 0.01, Math.sin(rotAngle) * 0.05]}
              rotation={[0.3, rotAngle, 0.2]}
              scale={[0.035, 0.008, 0.05]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#BC687E" roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
