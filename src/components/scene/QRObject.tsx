'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isCenterSeedZone, isFinderPattern, QRData } from '@/lib/qr';
import { SakuraStage } from '@/lib/animation';

interface QRObjectProps {
  qrData: QRData | null;
  targetUrl: string;
  stage: SakuraStage;
  activationProgress: number; // 0 to 1
  germinationProgress: number; // 0 to 1
  onTapGrow: () => void;
}

export function QRObject({
  qrData,
  targetUrl,
  stage,
  activationProgress,
  germinationProgress,
  onTapGrow,
}: QRObjectProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const seedRef = useRef<THREE.Group>(null);
  const qrPlaneRef = useRef<THREE.Mesh>(null);

  // Generate crisp 3D QR texture directly from dataURL for guaranteed phone camera scannability
  const qrTexture = useMemo(() => {
    if (!qrData?.dataURL) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(qrData.dataURL);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [qrData?.dataURL]);

  // Compute 3D positions and properties of all dark modules in the QR
  const { moduleData, totalActiveModules, qrWorldSize, cellSize } = useMemo(() => {
    if (!qrData || !qrData.matrix.length) {
      return { moduleData: [], totalActiveModules: 0, qrWorldSize: 2.3, cellSize: 0.09 };
    }

    const size = qrData.size;
    const qrWorldSize = 2.4; // World units
    const cellSize = qrWorldSize / size;
    const half = (size - 1) / 2;

    const list: Array<{
      x: number;
      z: number;
      row: number;
      col: number;
      isFinder: boolean;
      isSeedZone: boolean;
      distToCenter: number;
      angle: number;
    }> = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qrData.matrix[r][c]) {
          const isSeed = isCenterSeedZone(r, c, size);
          const x = (c - half) * cellSize;
          const z = (r - half) * cellSize;
          const dist = Math.sqrt(x * x + z * z);
          const angle = Math.atan2(z, x);

          list.push({
            x,
            z,
            row: r,
            col: c,
            isFinder: isFinderPattern(r, c, size),
            isSeedZone: isSeed,
            distToCenter: dist,
            angle,
          });
        }
      }
    }

    return {
      moduleData: list,
      totalActiveModules: list.length,
      qrWorldSize,
      cellSize,
    };
  }, [qrData]);

  // Initial setup for the instanced modules
  useEffect(() => {
    if (!meshRef.current || !moduleData.length) return;

    const dummy = new THREE.Object3D();
    const darkPlum = new THREE.Color('#221219');
    const roseGold = new THREE.Color('#4E1A2B');

    moduleData.forEach((mod, i) => {
      dummy.position.set(mod.x, 0.038, mod.z);
      dummy.scale.set(cellSize * 0.96, 0.016, cellSize * 0.96);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, mod.isFinder ? roseGold : darkPlum);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [moduleData, cellSize]);

  // Activation & Dissolution Particles Setup
  const { particlePositions, particleOrigins } = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const origins = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const srcMod = moduleData[i % (moduleData.length || 1)] || { x: 0, z: 0 };
      const jitterX = (Math.random() - 0.5) * cellSize;
      const jitterZ = (Math.random() - 0.5) * cellSize;
      const x = srcMod.x + jitterX;
      const y = 0.04;
      const z = srcMod.z + jitterZ;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      origins[i * 3 + 0] = x;
      origins[i * 3 + 1] = y;
      origins[i * 3 + 2] = z;
    }

    return {
      particlePositions: positions,
      particleOrigins: origins,
    };
  }, [moduleData, cellSize]);

  // Click on QR code handler: Opens target URL (e.g. Ocha Party website)
  const handleQRClick = (e: any) => {
    e.stopPropagation();
    if (stage === SakuraStage.QR_IDLE && targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Frame update
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Instanced QR Blocks Animation
    if (meshRef.current && moduleData.length > 0) {
      const dummy = new THREE.Object3D();
      const isVisible = germinationProgress < 0.95;

      if (isVisible) {
        meshRef.current.visible = true;
        const lift = Math.sin(time * 2.5) * 0.003;

        for (let i = 0; i < moduleData.length; i++) {
          const mod = moduleData[i];
          let scaleFactor = 1.0;
          let y = 0.038;

          if (activationProgress > 0) {
            const wave = Math.sin(time * 5 + mod.distToCenter * 4) * 0.02;
            const dissolveRatio = Math.max(0, 1 - activationProgress * 1.3);
            scaleFactor = dissolveRatio;
            y = 0.038 + activationProgress * 0.08 + wave;
          } else {
            y += lift;
          }

          if (germinationProgress > 0) {
            y -= germinationProgress * 0.08;
            scaleFactor = Math.max(0, scaleFactor * (1 - germinationProgress));
          }

          dummy.position.set(mod.x, y, mod.z);
          dummy.scale.set(
            cellSize * 0.96 * scaleFactor,
            0.016 * scaleFactor,
            cellSize * 0.96 * scaleFactor
          );
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      } else {
        meshRef.current.visible = false;
      }
    }

    // 2. Base QR backing plate visibility/fade
    if (qrPlaneRef.current) {
      if (germinationProgress > 0.05) {
        qrPlaneRef.current.visible = false;
      } else {
        qrPlaneRef.current.visible = true;
      }
    }

    // 3. Dissolution Particle Swarm
    if (particlesRef.current) {
      if (activationProgress > 0.01 && activationProgress < 0.99) {
        particlesRef.current.visible = true;
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const ox = particleOrigins[i * 3 + 0];
          const oy = particleOrigins[i * 3 + 1];
          const oz = particleOrigins[i * 3 + 2];

          const p = activationProgress;
          const currentRadius = Math.sqrt(ox * ox + oz * oz) * (1 - p);
          const currentAngle = Math.atan2(oz, ox) + p * 6.0 + i * 0.01;

          const px = Math.cos(currentAngle) * currentRadius;
          const pz = Math.sin(currentAngle) * currentRadius;
          const py = oy + Math.sin(p * Math.PI) * (0.35 + (i % 10) * 0.04);

          posAttr.setXYZ(i, px, py, pz);
        }
        posAttr.needsUpdate = true;
      } else {
        particlesRef.current.visible = false;
      }
    }

    // 4. Central Glowing Seed
    if (seedRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.08;
      let seedScale = pulse;
      let seedY = 0.045;

      if (stage === SakuraStage.QR_IDLE) {
        seedScale = pulse * 0.72;
      } else if (activationProgress > 0 && germinationProgress === 0) {
        seedScale = pulse * (1 + activationProgress * 1.5);
      } else if (germinationProgress > 0) {
        seedScale = Math.max(0, (1 - germinationProgress) * 2.2);
        seedY = 0.045 - germinationProgress * 0.05;
      }

      seedRef.current.position.y = seedY;
      seedRef.current.scale.set(seedScale, seedScale, seedScale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Crisp White/Ivory Quiet Zone Backing Plate with Scannable QR Texture */}
      {qrTexture && (
        <mesh
          ref={qrPlaneRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.033, 0]}
          receiveShadow
          onClick={handleQRClick}
          onPointerOver={() => {
            if (stage === SakuraStage.QR_IDLE) document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[qrWorldSize + 0.35, qrWorldSize + 0.35]} />
          <meshBasicMaterial
            map={qrTexture}
            color="#FFFFFF"
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D Instanced QR Code Modules */}
      {totalActiveModules > 0 && (
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, totalActiveModules]}
          castShadow
          receiveShadow
          onClick={handleQRClick}
          onPointerOver={() => {
            if (stage === SakuraStage.QR_IDLE) document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#221219"
            roughness={0.35}
            metalness={0.05}
            emissive={activationProgress > 0 ? '#EBA9B8' : '#000000'}
            emissiveIntensity={activationProgress * 0.8}
          />
        </instancedMesh>
      )}

      {/* Activation Dissolution Particle Swarm */}
      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
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

      {/* Central Dormant / Awakening Sakura Seed (Digital Core) */}
      <group
        ref={seedRef}
        position={[0, 0.045, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (stage === SakuraStage.QR_IDLE) onTapGrow();
        }}
        onPointerOver={() => {
          if (stage === SakuraStage.QR_IDLE) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Glowing Sakura Seed Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#EBA9B8"
            emissive="#EBA9B8"
            emissiveIntensity={0.7 + activationProgress * 2.0}
            roughness={0.2}
          />
        </mesh>

        {/* Tiny golden bud halo */}
        <mesh scale={[1.25, 1.25, 1.25]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial
            color="#FFF2E0"
            transparent
            opacity={0.35 + activationProgress * 0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Four tiny sprouting petal leaves around seed */}
        {[0, 1, 2, 3].map((idx) => {
          const rotAngle = (idx * Math.PI) / 2;
          return (
            <mesh
              key={`seed-petal-${idx}`}
              position={[Math.cos(rotAngle) * 0.05, 0.01, Math.sin(rotAngle) * 0.05]}
              rotation={[0.3, rotAngle, 0.2]}
              scale={[0.035, 0.008, 0.05]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial
                color="#BC687E"
                roughness={0.3}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
