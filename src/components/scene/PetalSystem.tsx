'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SakuraStage } from '@/lib/animation';
import { createBlossomPetalTexture } from '@/lib/textures';

interface PetalSystemProps {
  stage: SakuraStage;
  breezeIntensity: number; // 0.5 to 3.0
  blossomProgress: number; // 0.0 to 1.0
}

/**
 * Creates an authentic single cherry blossom petal geometry.
 * Very thin, soft, and slightly curved with the characteristic apical notch.
 */
function createRealisticSinglePetalGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();

  // 11 vertices for a delicate, curved 3D petal
  const positions = new Float32Array([
    0.0, 0.0, 0.0,            // 0: Base claw
    -0.032, 0.008, 0.038,     // 1: Lower left
    0.032, 0.008, 0.038,      // 2: Lower right
    -0.044, 0.016, 0.082,     // 3: Mid left
    0.0, 0.006, 0.078,        // 4: Mid center
    0.044, 0.016, 0.082,      // 5: Mid right
    -0.032, 0.024, 0.128,     // 6: Tip left lobe
    0.0, 0.016, 0.114,        // 7: Cleft notch
    0.032, 0.024, 0.128,      // 8: Tip right lobe
    -0.015, 0.022, 0.126,     // 9: Left notch edge
    0.015, 0.022, 0.126,      // 10: Right notch edge
  ]);

  const indices = [
    0, 1, 4,
    0, 4, 2,
    1, 3, 4,
    4, 5, 2,
    3, 6, 9,
    3, 9, 4,
    4, 9, 7,
    4, 7, 10,
    4, 10, 5,
    5, 10, 8,
  ];

  const uvs = new Float32Array([
    0.5, 0.95,
    0.28, 0.72,
    0.72, 0.72,
    0.15, 0.45,
    0.5, 0.45,
    0.85, 0.45,
    0.22, 0.12,
    0.5, 0.22,
    0.78, 0.12,
    0.36, 0.14,
    0.64, 0.14,
  ]);

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export function PetalSystem({ stage, breezeIntensity, blossomProgress }: PetalSystemProps) {
  const fgMeshRef = useRef<THREE.InstancedMesh>(null);
  const midMeshRef = useRef<THREE.InstancedMesh>(null);
  const bgMeshRef = useRef<THREE.InstancedMesh>(null);
  const settledMeshRef = useRef<THREE.InstancedMesh>(null);

  const petalGeo = useMemo(() => createRealisticSinglePetalGeometry(), []);
  const petalTexture = useMemo(() => createBlossomPetalTexture(), []);

  // Material: Translucent double-sided blush petal
  const petalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: petalTexture,
      color: '#FFF8FA',
      roughness: 0.38,
      metalness: 0.01,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      shadowSide: THREE.DoubleSide,
      alphaTest: 0.02,
    });
  }, [petalTexture]);

  // Spatial Layer 1: Foreground Petals (Subtle, soft focus, passing close to camera)
  const fgCount = 18;
  const fgData = useMemo(() => {
    return Array.from({ length: fgCount }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 4.2,
        1.8 + Math.random() * 2.2,
        2.4 + Math.random() * 1.6
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.2
      ),
      fallSpeed: 0.20 + Math.random() * 0.18,
      swayFreq: 1.2 + Math.random() * 1.6,
      swayAmp: 0.25 + Math.random() * 0.3,
      scale: 1.1 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [fgCount]);

  // Spatial Layer 2: Midground Petals (Around tree canopy & platform with wind swirl)
  const midCount = 160;
  const midData = useMemo(() => {
    return Array.from({ length: midCount }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 5.2,
        0.3 + Math.random() * 3.8,
        (Math.random() - 0.5) * 5.2
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.8,
        (Math.random() - 0.5) * 1.8
      ),
      fallSpeed: 0.24 + Math.random() * 0.26,
      swayFreq: 1.4 + Math.random() * 1.8,
      swayAmp: 0.35 + Math.random() * 0.4,
      scale: 0.75 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [midCount]);

  // Spatial Layer 3: Background Petals (Distant dancing specks)
  const bgCount = 80;
  const bgData = useMemo(() => {
    return Array.from({ length: bgCount }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 7.5,
        1.2 + Math.random() * 4.2,
        -1.8 - Math.random() * 3.5
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.0
      ),
      fallSpeed: 0.16 + Math.random() * 0.2,
      swayFreq: 0.9 + Math.random() * 1.2,
      swayAmp: 0.2 + Math.random() * 0.25,
      scale: 0.50 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [bgCount]);

  // Settled Ground Petals (Quietly resting on ivory platform and zen stones)
  const settledCount = 80;
  const settledData = useMemo(() => {
    return Array.from({ length: settledCount }, () => {
      const radius = 0.25 + Math.random() * 2.1;
      const angle = Math.random() * Math.PI * 2;
      return {
        pos: new THREE.Vector3(
          Math.cos(angle) * radius,
          0.034, // Resting on stone surface
          Math.sin(angle) * radius
        ),
        rot: new THREE.Euler(-Math.PI / 2 + (Math.random() - 0.5) * 0.08, 0, Math.random() * Math.PI * 2),
        scale: 0.65 + Math.random() * 0.35,
      };
    });
  }, [settledCount]);

  // Frame update
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    // In Stage 0 (Seed): gentle drift
    // In Stage 4-5: Full bloom breeze
    const activeMultiplier = stage === SakuraStage.SEED ? 0.2 : 0.25 + blossomProgress * 0.75;

    // 1. Foreground Petals
    if (fgMeshRef.current) {
      const maxFg = Math.floor(fgCount * activeMultiplier);
      for (let i = 0; i < fgCount; i++) {
        const p = fgData[i];
        if (i < maxFg) {
          // Aerodynamic falling with pendular sway
          p.pos.y -= p.fallSpeed * delta;
          p.pos.x += Math.sin(time * p.swayFreq + p.phase) * p.swayAmp * delta * breezeIntensity;
          p.pos.z += Math.cos(time * 0.7 + p.phase) * 0.12 * delta;

          // Gentle rotation tumble
          p.rot.x += p.rotSpeed.x * delta * breezeIntensity;
          p.rot.y += p.rotSpeed.y * delta * breezeIntensity;
          p.rot.z += p.rotSpeed.z * delta * breezeIntensity;

          // Respawn at top
          if (p.pos.y < 0.25) {
            p.pos.y = 3.6 + Math.random() * 1.0;
            p.pos.x = (Math.random() - 0.5) * 4.2;
          }

          dummy.position.copy(p.pos);
          dummy.rotation.copy(p.rot);
          dummy.scale.set(p.scale, p.scale, p.scale);
        } else {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        fgMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      fgMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Midground Petals (Around Tree Canopy)
    if (midMeshRef.current) {
      const maxMid = Math.floor(midCount * activeMultiplier);
      for (let i = 0; i < midCount; i++) {
        const p = midData[i];
        if (i < maxMid) {
          p.pos.y -= p.fallSpeed * delta;

          // Gentle wind swirl around canopy
          const distToCenter = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
          const spiralAngle = Math.atan2(p.pos.z, p.pos.x) + 0.45 * delta * breezeIntensity;
          const swaySide = Math.sin(time * p.swayFreq + p.phase) * p.swayAmp * delta * breezeIntensity;

          p.pos.x = Math.cos(spiralAngle) * distToCenter + swaySide;
          p.pos.z = Math.sin(spiralAngle) * distToCenter;

          p.rot.x += p.rotSpeed.x * delta * breezeIntensity;
          p.rot.y += p.rotSpeed.y * delta * breezeIntensity;
          p.rot.z += p.rotSpeed.z * delta * breezeIntensity;

          if (p.pos.y < 0.04) {
            p.pos.y = 3.4 + Math.random() * 1.2;
            p.pos.x = (Math.random() - 0.5) * 4.8;
            p.pos.z = (Math.random() - 0.5) * 4.8;
          }

          dummy.position.copy(p.pos);
          dummy.rotation.copy(p.rot);
          dummy.scale.set(p.scale, p.scale, p.scale);
        } else {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        midMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      midMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Background Petals
    if (bgMeshRef.current) {
      const maxBg = Math.floor(bgCount * activeMultiplier);
      for (let i = 0; i < bgCount; i++) {
        const p = bgData[i];
        if (i < maxBg) {
          p.pos.y -= p.fallSpeed * delta;
          p.pos.x += Math.sin(time * 0.7 + p.phase) * 0.25 * delta * breezeIntensity;

          p.rot.x += p.rotSpeed.x * delta;
          p.rot.y += p.rotSpeed.y * delta;

          if (p.pos.y < 0.1) {
            p.pos.y = 3.8 + Math.random() * 1.2;
            p.pos.x = (Math.random() - 0.5) * 7.5;
          }

          dummy.position.copy(p.pos);
          dummy.rotation.copy(p.rot);
          dummy.scale.set(p.scale, p.scale, p.scale);
        } else {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        bgMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      bgMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Settled Ground Petals
    if (settledMeshRef.current) {
      const countVisible = stage !== SakuraStage.SEED
        ? Math.floor(settledCount * Math.min(1.0, 0.2 + blossomProgress * 0.8))
        : 18;

      for (let i = 0; i < settledCount; i++) {
        const s = settledData[i];
        if (i < countVisible) {
          dummy.position.copy(s.pos);
          dummy.rotation.copy(s.rot);
          dummy.scale.set(s.scale, s.scale, s.scale);
        } else {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        settledMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      settledMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Foreground Petals (Cinematic Depth of Field) */}
      <instancedMesh
        ref={fgMeshRef}
        args={[petalGeo, petalMaterial, fgCount]}
        castShadow
      />

      {/* 2. Midground Petals (Canopy Breeze) */}
      <instancedMesh
        ref={midMeshRef}
        args={[petalGeo, petalMaterial, midCount]}
        castShadow
      />

      {/* 3. Background Petals */}
      <instancedMesh
        ref={bgMeshRef}
        args={[petalGeo, petalMaterial, bgCount]}
      />

      {/* 4. Settled Ground Petals */}
      <instancedMesh
        ref={settledMeshRef}
        args={[petalGeo, petalMaterial, settledCount]}
        receiveShadow
      />
    </group>
  );
}
