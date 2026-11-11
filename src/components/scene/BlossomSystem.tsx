'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createBlossomPetalTexture, createFlowerCenterTexture } from '@/lib/textures';

export interface BlossomPoint {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  normal: THREE.Vector3;
  scale: number;
  phase: number;
  colorType: number; // 0: pale ivory pink, 1: soft blush pink, 2: radiant sakura, 3: rose accent
}

interface BlossomSystemProps {
  blossomPoints: BlossomPoint[];
  blossomProgress: number; // 0.0 to 1.0 (unfolding)
  blossomDensity: number; // 0.5 to 2.0
  breezeIntensity: number; // 0.5 to 3.0
  treeSway: React.MutableRefObject<{ x: number; z: number }>;
}

/**
 * Creates an authentic 5-petal Yoshino cherry blossom geometry.
 * Each petal is individually curved, cupped upwards, and features
 * the signature cleft notch at the apex. UVs are mapped to the procedural
 * translucent petal texture.
 */
function createBotanicalYoshinoGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let vertexIndex = 0;

  // Center hub (claw origin)
  positions.push(0, 0.012, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 0.95);
  const centerIdx = vertexIndex++;

  const numPetals = 5;

  for (let p = 0; p < numPetals; p++) {
    const anglePetal = (p * 2 * Math.PI) / numPetals;
    const petalSpread = (2 * Math.PI) / numPetals * 0.44;

    // Petal base ring (imbricate overlap)
    const baseAngleL = anglePetal - petalSpread * 0.38;
    const baseAngleR = anglePetal + petalSpread * 0.38;
    const rBase = 0.032;

    const baseLIdx = vertexIndex++;
    positions.push(Math.cos(baseAngleL) * rBase, 0.010, Math.sin(baseAngleL) * rBase);
    normals.push(0, 0.96, 0.12);
    uvs.push(0.35, 0.85);

    const baseRIdx = vertexIndex++;
    positions.push(Math.cos(baseAngleR) * rBase, 0.010, Math.sin(baseAngleR) * rBase);
    normals.push(0, 0.96, 0.12);
    uvs.push(0.65, 0.85);

    // Petal mid vertices (cupped outward and upward)
    const midAngleL = anglePetal - petalSpread * 0.82;
    const midAngleR = anglePetal + petalSpread * 0.82;
    const rMid = 0.115;
    const yMid = 0.026; // Gentle 3D cup

    const midLIdx = vertexIndex++;
    positions.push(Math.cos(midAngleL) * rMid, yMid, Math.sin(midAngleL) * rMid);
    normals.push(-Math.sin(midAngleL) * 0.2, 0.90, Math.cos(midAngleL) * 0.2);
    uvs.push(0.12, 0.45);

    const midRIdx = vertexIndex++;
    positions.push(Math.cos(midAngleR) * rMid, yMid, Math.sin(midAngleR) * rMid);
    normals.push(Math.sin(midAngleR) * 0.2, 0.90, -Math.cos(midAngleR) * 0.2);
    uvs.push(0.88, 0.45);

    // Mid center support
    const midCIdx = vertexIndex++;
    positions.push(Math.cos(anglePetal) * rMid * 0.95, yMid * 0.85, Math.sin(anglePetal) * rMid * 0.95);
    normals.push(0, 0.94, 0.1);
    uvs.push(0.5, 0.45);

    // Petal tip lobe 1 (left peak)
    const tipAngleL = anglePetal - petalSpread * 0.36;
    const rTipL = 0.175;
    const yTip = 0.042; // Flaring rim
    const tipLIdx = vertexIndex++;
    positions.push(Math.cos(tipAngleL) * rTipL, yTip, Math.sin(tipAngleL) * rTipL);
    normals.push(0, 0.86, 0.28);
    uvs.push(0.28, 0.12);

    // Petal tip cleft notch (signature sakura notch)
    const rNotch = 0.152;
    const notchIdx = vertexIndex++;
    positions.push(Math.cos(anglePetal) * rNotch, yTip - 0.006, Math.sin(anglePetal) * rNotch);
    normals.push(0, 0.88, 0.25);
    uvs.push(0.5, 0.22);

    // Petal tip lobe 2 (right peak)
    const tipAngleR = anglePetal + petalSpread * 0.36;
    const rTipR = 0.175;
    const tipRIdx = vertexIndex++;
    positions.push(Math.cos(tipAngleR) * rTipR, yTip, Math.sin(tipAngleR) * rTipR);
    normals.push(0, 0.86, 0.28);
    uvs.push(0.72, 0.12);

    // Triangulation
    // Base to mid
    indices.push(centerIdx, baseLIdx, midLIdx);
    indices.push(centerIdx, midLIdx, midCIdx);
    indices.push(centerIdx, midCIdx, midRIdx);
    indices.push(centerIdx, midRIdx, baseRIdx);

    // Mid to tip lobes & notch
    indices.push(midLIdx, tipLIdx, notchIdx);
    indices.push(midLIdx, notchIdx, midCIdx);
    indices.push(midCIdx, notchIdx, tipRIdx);
    indices.push(midCIdx, tipRIdx, midRIdx);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export function BlossomSystem({
  blossomPoints,
  blossomProgress,
  blossomDensity,
  breezeIntensity,
  treeSway,
}: BlossomSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const centersRef = useRef<THREE.InstancedMesh>(null);

  // Textures
  const petalTexture = useMemo(() => createBlossomPetalTexture(), []);
  const centerTexture = useMemo(() => createFlowerCenterTexture(), []);

  // Geometries
  const flowerGeo = useMemo(() => createBotanicalYoshinoGeometry(), []);
  const centerDiscGeo = useMemo(() => {
    const geo = new THREE.CircleGeometry(0.042, 12);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Filter or limit active points based on density
  const activeBlossoms = useMemo(() => {
    if (!blossomPoints.length) return [];
    const maxCount = Math.floor(blossomPoints.length * Math.min(2.0, blossomDensity));
    return blossomPoints.slice(0, maxCount);
  }, [blossomPoints, blossomDensity]);

  // Subtle natural color palette (Japanese spring tints)
  const colors = useMemo(() => {
    return [
      new THREE.Color('#FFFBFD'), // Translucent pale ivory pink (Yoshino opening)
      new THREE.Color('#FCEEF2'), // Delicate blush white-pink
      new THREE.Color('#F7D7DE'), // Classic spring sakura pink
      new THREE.Color('#F2B8C6'), // Deeper rose blush in inner canopy
    ];
  }, []);

  // Frame update
  useFrame((state) => {
    if (!meshRef.current || !activeBlossoms.length) return;

    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    const dummyCenter = new THREE.Object3D();

    const count = activeBlossoms.length;
    const isVisible = blossomProgress > 0.01;

    meshRef.current.visible = isVisible;
    if (centersRef.current) centersRef.current.visible = isVisible;

    if (!isVisible) return;

    for (let i = 0; i < count; i++) {
      const pt = activeBlossoms[i];

      // Staggered blooming per blossom based on phase
      const staggerProgress = Math.max(0, Math.min(1, (blossomProgress - pt.phase * 0.42) / 0.58));

      if (staggerProgress <= 0) {
        dummy.position.set(0, -999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        if (centersRef.current) centersRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Smooth organic blooming curve (elastic petal unfurling)
      const popEase = Math.sin(staggerProgress * Math.PI * 0.5);
      const currentScale = pt.scale * popEase;

      // Soft flutter in spring breeze
      const flutterX = Math.sin(time * 2.8 + pt.phase * 9) * 0.08 * breezeIntensity;
      const flutterY = Math.cos(time * 2.2 + pt.phase * 7) * 0.09 * breezeIntensity;
      const flutterZ = Math.sin(time * 3.1 + pt.phase * 5) * 0.07 * breezeIntensity;

      // Height-based tree sway
      const heightRatio = Math.max(0, pt.position.y / 3.5);
      const swayX = treeSway.current.x * heightRatio * 0.45;
      const swayZ = treeSway.current.z * heightRatio * 0.45;

      dummy.position.set(
        pt.position.x + swayX,
        pt.position.y,
        pt.position.z + swayZ
      );

      // Orient blossom outward and drooping slightly
      dummy.lookAt(
        pt.position.x + pt.direction.x + flutterX,
        pt.position.y + pt.direction.y + flutterY - 0.2,
        pt.position.z + pt.direction.z + flutterZ
      );

      // Unfurling twist
      dummy.rotateZ(pt.phase * Math.PI * 2 + staggerProgress * 0.4);

      dummy.scale.set(currentScale, currentScale, currentScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Flower Center (Stamens & Calyx)
      if (centersRef.current) {
        dummyCenter.position.copy(dummy.position);
        dummyCenter.rotation.copy(dummy.rotation);
        dummyCenter.translateY(0.014 * currentScale);
        const centerScale = currentScale * 0.9;
        dummyCenter.scale.set(centerScale, centerScale, centerScale);
        dummyCenter.updateMatrix();
        centersRef.current.setMatrixAt(i, dummyCenter.matrix);
      }

      // Color variation per flower
      if (meshRef.current.instanceColor) {
        const col = colors[(i + pt.colorType) % colors.length];
        meshRef.current.setColorAt(i, col);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (centersRef.current) {
      centersRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Five-Petal Yoshino Cherry Blossoms */}
      <instancedMesh
        ref={meshRef}
        args={[flowerGeo, undefined, activeBlossoms.length || 1]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={petalTexture}
          color="#FFF8FA"
          roughness={0.32}
          metalness={0.02}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
          transparent
          alphaTest={0.05}
        />
      </instancedMesh>

      {/* 2. Detailed Flower Center Rosettes (Crimson Nectary & Golden Stamens) */}
      <instancedMesh
        ref={centersRef}
        args={[centerDiscGeo, undefined, activeBlossoms.length || 1]}
      >
        <meshStandardMaterial
          map={centerTexture}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent
          alphaTest={0.1}
          emissive="#6E1E34"
          emissiveIntensity={0.2}
        />
      </instancedMesh>
    </group>
  );
}
