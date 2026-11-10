'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BlossomPoint } from './BlossomSystem';
import { createBarkTextures } from '@/lib/textures';

interface TreeGrowthProps {
  germinationProgress: number; // 0.0 to 1.0
  growthProgress: number; // 0.0 to 1.0
  breezeIntensity: number;
  treeSway: { x: number; z: number };
}

interface BranchDef {
  curve: THREE.CatmullRomCurve3;
  radiusStart: number;
  radiusEnd: number;
  growthStart: number;
  growthEnd: number;
  length: number;
  isTrunk?: boolean;
}

/**
 * Creates an organic, tapered branch geometry with realistic longitudinal
 * bark grooves, non-circular cross-sections, and buttress root flares.
 */
function createOrganicBranchGeometry(
  curve: THREE.CatmullRomCurve3,
  radiusStart: number,
  radiusEnd: number,
  growthRatio: number,
  radialSegments = 16,
  isTrunk = false
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const tubularSegments = Math.max(12, Math.floor(curve.getLength() * 24));
  const activeSegments = Math.max(2, Math.floor(tubularSegments * growthRatio));

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Frenet frames along curve
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  for (let i = 0; i <= activeSegments; i++) {
    const u = (i / tubularSegments) * growthRatio;
    const point = curve.getPoint(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Smooth botanical taper
    const baseRadius = THREE.MathUtils.lerp(radiusStart, radiusEnd, Math.pow(u, 0.75));

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const theta = v * Math.PI * 2;

      const sin = Math.sin(theta);
      const cos = Math.cos(theta);

      // Organic bark groove perturbation
      let radius = baseRadius;

      // Longitudinal bark ribs
      const ribCount = isTrunk ? 6 : 4;
      const ribWave = Math.cos(theta * ribCount + u * 4.0) * 0.08;
      const fineNoise = Math.sin(theta * 12.0 - u * 10.0) * 0.035;
      radius *= (1 + ribWave + fineNoise);

      // Buttress root flare near trunk base
      if (isTrunk && u < 0.28) {
        const flareWeight = Math.pow(1 - u / 0.28, 2.2);
        const rootFluting = (1 + 0.45 * Math.cos(theta * 5.0 + 0.3));
        radius += 0.18 * flareWeight * rootFluting;
      }

      // Vertex position
      const normalX = N.x * cos + B.x * sin;
      const normalY = N.y * cos + B.y * sin;
      const normalZ = N.z * cos + B.z * sin;

      const vx = point.x + normalX * radius;
      const vy = point.y + normalY * radius;
      const vz = point.z + normalZ * radius;

      positions.push(vx, vy, vz);
      normals.push(normalX, normalY, normalZ);
      uvs.push(v * 2.0, u * 8.0);
    }
  }

  // Generate face indices
  for (let i = 0; i < activeSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export function useTreeStructure() {
  return useMemo(() => {
    const branches: BranchDef[] = [];
    const blossomPoints: BlossomPoint[] = [];

    // Helper to add branch spline
    const addBranch = (
      points: [number, number, number][],
      radiusStart: number,
      radiusEnd: number,
      growthStart: number,
      growthEnd: number,
      generateBlossoms = true,
      isTrunk = false
    ) => {
      const vPoints = points.map((p) => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(vPoints, false, 'centripetal', 0.5);
      const length = curve.getLength();

      branches.push({
        curve,
        radiusStart,
        radiusEnd,
        growthStart,
        growthEnd,
        length,
        isTrunk,
      });

      // Generate blossoms in authentic corymb/cluster sprays (groups of 2-5 flowers)
      if (generateBlossoms) {
        // Distribute cluster nodes along branch
        const numClusters = Math.floor(length * 14);

        for (let c = 0; c < numClusters; c++) {
          // Concentrate toward outer 75% of branch length
          const u = 0.28 + (c / Math.max(1, numClusters)) * 0.72;
          const posOnCurve = curve.getPoint(u);
          const tangent = curve.getTangent(u);

          // Node orientation
          const angleNode = (c * 2.399963) + Math.sin(u * 14);
          const normalNode = new THREE.Vector3(-tangent.z, tangent.x + 0.1, tangent.y).normalize();
          const binormalNode = new THREE.Vector3().crossVectors(tangent, normalNode).normalize();

          // Cluster stalk origin
          const clusterDir = new THREE.Vector3()
            .addScaledVector(normalNode, Math.cos(angleNode))
            .addScaledVector(binormalNode, Math.sin(angleNode))
            .normalize();

          // 2 to 4 flowers per corymb cluster
          const flowersInCluster = 2 + Math.floor(Math.random() * 3);

          for (let f = 0; f < flowersInCluster; f++) {
            const spreadAngle = (f / flowersInCluster) * Math.PI * 2 + Math.random() * 0.5;
            const spreadRad = 0.06 + Math.random() * 0.12;

            // Slender pedicel drooping downward under gravity
            const pedicelOffset = clusterDir.clone().multiplyScalar(0.08 + Math.random() * 0.14);
            pedicelOffset.x += Math.cos(spreadAngle) * spreadRad;
            pedicelOffset.z += Math.sin(spreadAngle) * spreadRad;
            pedicelOffset.y -= 0.05 + Math.random() * 0.06; // Elegant botanical droop

            const flowerPos = posOnCurve.clone().add(pedicelOffset);

            blossomPoints.push({
              position: flowerPos,
              direction: clusterDir.clone().add(new THREE.Vector3(0, -0.4, 0)).normalize(),
              normal: pedicelOffset.clone().normalize(),
              scale: 0.72 + Math.random() * 0.45,
              phase: Math.random(),
              colorType: Math.floor(Math.random() * 4),
            });
          }
        }
      }
    };

    // 1. GNARLED YOSHINO TRUNK & BUTTRESS ROOTS (Authentic Japanese Botanical Asymmetry)
    // Buttressed surface roots
    addBranch([[0, 0.04, 0], [0.38, 0.02, 0.28], [0.72, -0.01, 0.52]], 0.22, 0.04, 0.0, 0.32, false, true);
    addBranch([[0, 0.04, 0], [-0.42, 0.02, 0.25], [-0.82, -0.01, 0.42]], 0.20, 0.035, 0.0, 0.32, false, true);
    addBranch([[0, 0.04, 0], [-0.32, 0.02, -0.38], [-0.68, -0.01, -0.72]], 0.19, 0.035, 0.0, 0.32, false, true);
    addBranch([[0, 0.04, 0], [0.35, 0.02, -0.32], [0.75, -0.01, -0.58]], 0.18, 0.03, 0.0, 0.32, false, true);
    addBranch([[0, 0.04, 0], [0.08, 0.02, 0.48], [0.18, -0.01, 0.88]], 0.17, 0.03, 0.0, 0.32, false, true);

    // Main Gnarled Trunk (curving organically with authentic bonsai/garden aesthetic)
    addBranch(
      [
        [0, 0.02, 0],
        [0.09, 0.38, -0.05],
        [0.22, 0.78, 0.08],
        [0.12, 1.18, 0.03],
        [-0.06, 1.48, -0.06],
      ],
      0.28,
      0.17,
      0.0,
      0.36,
      false,
      true
    );

    // 2. PRIMARY SCAFFOLD BOUGHS (Horizontal spreading habit of mature Yoshino)
    // Bough 1: East / Right canopy scaffold
    addBranch(
      [
        [-0.06, 1.48, -0.06],
        [0.38, 1.68, 0.18],
        [0.92, 1.92, 0.38],
        [1.55, 2.08, 0.48],
        [2.12, 2.18, 0.58],
      ],
      0.14,
      0.055,
      0.16,
      0.54,
      true
    );

    // Bough 2: West / Left graceful sweeping bough
    addBranch(
      [
        [-0.06, 1.48, -0.06],
        [-0.46, 1.64, 0.14],
        [-1.02, 1.85, 0.32],
        [-1.65, 2.02, 0.42],
        [-2.22, 2.12, 0.45],
      ],
      0.14,
      0.055,
      0.18,
      0.56,
      true
    );

    // Bough 3: North / Back sweeping limb
    addBranch(
      [
        [-0.06, 1.48, -0.06],
        [-0.10, 1.72, -0.46],
        [0.22, 1.98, -0.95],
        [0.62, 2.18, -1.48],
        [0.95, 2.28, -1.95],
      ],
      0.13,
      0.05,
      0.20,
      0.58,
      true
    );

    // Bough 4: South-Forward lower arch
    addBranch(
      [
        [-0.06, 1.48, -0.06],
        [0.08, 1.62, 0.42],
        [0.35, 1.82, 0.95],
        [0.58, 1.95, 1.45],
        [0.72, 2.02, 1.85],
      ],
      0.12,
      0.045,
      0.22,
      0.60,
      true
    );

    // Bough 5: Central Crown Dome
    addBranch(
      [
        [-0.06, 1.48, -0.06],
        [-0.14, 1.85, -0.08],
        [-0.06, 2.28, -0.02],
        [0.14, 2.72, 0.08],
        [0.25, 3.12, 0.12],
      ],
      0.13,
      0.045,
      0.24,
      0.62,
      true
    );

    // 3. SECONDARY & SUB-CANOPY BRANCHLETS
    // Off Bough 1 (Right):
    addBranch([[0.92, 1.92, 0.38], [1.32, 2.28, 0.12], [1.78, 2.48, -0.15]], 0.055, 0.022, 0.38, 0.76, true);
    addBranch([[1.55, 2.08, 0.48], [1.98, 2.38, 0.82], [2.38, 2.42, 1.12]], 0.048, 0.018, 0.42, 0.80, true);
    addBranch([[1.55, 2.08, 0.48], [1.82, 1.92, 0.22], [2.25, 1.82, 0.14]], 0.042, 0.016, 0.45, 0.82, true);
    addBranch([[2.12, 2.18, 0.58], [2.52, 2.32, 0.52], [2.85, 2.22, 0.45]], 0.035, 0.014, 0.52, 0.88, true);

    // Off Bough 2 (Left):
    addBranch([[-1.02, 1.85, 0.32], [-1.45, 2.22, -0.05], [-1.92, 2.42, -0.28]], 0.055, 0.022, 0.40, 0.78, true);
    addBranch([[-1.65, 2.02, 0.42], [-2.08, 2.32, 0.72], [-2.48, 2.38, 0.98]], 0.048, 0.018, 0.44, 0.82, true);
    addBranch([[-1.65, 2.02, 0.42], [-1.88, 1.85, 0.18], [-2.28, 1.72, 0.08]], 0.042, 0.016, 0.46, 0.84, true);
    addBranch([[-2.22, 2.12, 0.45], [-2.62, 2.22, 0.38], [-2.92, 2.12, 0.28]], 0.035, 0.014, 0.52, 0.88, true);

    // Off Bough 3 (Back):
    addBranch([[0.22, 1.98, -0.95], [-0.28, 2.28, -1.28], [-0.72, 2.45, -1.58]], 0.052, 0.02, 0.42, 0.80, true);
    addBranch([[0.62, 2.18, -1.48], [1.02, 2.42, -1.82], [1.38, 2.45, -2.18]], 0.046, 0.016, 0.46, 0.84, true);
    addBranch([[0.95, 2.28, -1.95], [1.28, 2.42, -2.28], [1.58, 2.32, -2.48]], 0.035, 0.014, 0.54, 0.90, true);

    // Off Bough 4 (Forward):
    addBranch([[0.35, 1.82, 0.95], [-0.12, 2.12, 1.32], [-0.45, 2.22, 1.65]], 0.048, 0.018, 0.44, 0.82, true);
    addBranch([[0.58, 1.95, 1.45], [0.92, 2.18, 1.82], [1.18, 2.18, 2.15]], 0.042, 0.016, 0.48, 0.86, true);

    // Off Crown Bough 5:
    addBranch([[-0.06, 2.28, -0.02], [-0.62, 2.58, 0.32], [-1.02, 2.75, 0.52]], 0.052, 0.02, 0.44, 0.82, true);
    addBranch([[-0.06, 2.28, -0.02], [0.52, 2.62, -0.32], [0.92, 2.78, -0.52]], 0.052, 0.02, 0.44, 0.82, true);
    addBranch([[0.14, 2.72, 0.08], [-0.28, 3.02, -0.15], [-0.55, 3.18, -0.25]], 0.042, 0.016, 0.50, 0.88, true);
    addBranch([[0.14, 2.72, 0.08], [0.42, 3.05, 0.32], [0.72, 3.22, 0.42]], 0.042, 0.016, 0.50, 0.88, true);
    addBranch([[0.25, 3.12, 0.12], [0.18, 3.38, 0.08], [0.09, 3.55, 0.02]], 0.032, 0.012, 0.56, 0.94, true);

    // Delicate airy terminal sprays
    addBranch([[1.32, 2.28, 0.12], [1.65, 2.55, 0.25], [1.92, 2.65, 0.35]], 0.028, 0.010, 0.58, 0.95, true);
    addBranch([[-1.45, 2.22, -0.05], [-1.75, 2.52, 0.18], [-2.02, 2.62, 0.28]], 0.028, 0.010, 0.58, 0.95, true);
    addBranch([[-0.62, 2.58, 0.32], [-0.85, 2.88, 0.18], [-1.08, 3.02, 0.08]], 0.028, 0.010, 0.60, 0.96, true);
    addBranch([[0.52, 2.62, -0.32], [0.82, 2.92, -0.18], [1.05, 3.05, -0.08]], 0.028, 0.010, 0.60, 0.96, true);

    return {
      branches,
      blossomPoints,
    };
  }, []);
}

export function TreeGrowth({
  germinationProgress,
  growthProgress,
  breezeIntensity,
  treeSway,
}: TreeGrowthProps) {
  const { branches } = useTreeStructure();

  // Bark textures & material
  const { map: barkMap, bumpMap: barkBump, roughnessMap: barkRough } = useMemo(
    () => createBarkTextures(),
    []
  );

  const barkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#463228',
      map: barkMap,
      bumpMap: barkBump,
      bumpScale: 0.12,
      roughnessMap: barkRough,
      roughness: 0.85,
      metalness: 0.02,
    });
  }, [barkMap, barkBump, barkRough]);

  // Sapling shoot material for germination
  const saplingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#5B6842',
      roughness: 0.45,
      metalness: 0.05,
    });
  }, []);

  return (
    <group>
      {/* 1. Stage 2 (Germination): Sprouting Sapling Shoot */}
      {germinationProgress > 0.02 && growthProgress < 0.4 && (
        <group position={[0, 0.04, 0]}>
          <mesh position={[0, germinationProgress * 0.25, 0]}>
            <cylinderGeometry
              args={[
                0.012,
                0.025,
                Math.max(0.01, germinationProgress * 0.5),
                16
              ]}
            />
            <primitive object={saplingMaterial} attach="material" />
          </mesh>

          {/* Tiny emerald leaf buds on shoot */}
          {[0, 1].map((leafIdx) => (
            <mesh
              key={`leaf-${leafIdx}`}
              position={[
                leafIdx === 0 ? 0.03 : -0.03,
                germinationProgress * 0.45,
                0
              ]}
              rotation={[0.3, leafIdx * Math.PI, 0.4]}
              scale={[0.02 * germinationProgress, 0.005, 0.04 * germinationProgress]}
            >
              <sphereGeometry args={[1, 12, 12]} />
              <primitive object={saplingMaterial} attach="material" />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Stage 3 (Tree Growth & Beyond): Tapered Organic Trunk & Branch System */}
      {growthProgress > 0.01 &&
        branches.map((b, idx) => {
          const localProgress = THREE.MathUtils.clamp(
            (growthProgress - b.growthStart) / (b.growthEnd - b.growthStart),
            0,
            1
          );

          if (localProgress <= 0.001) return null;

          // Generate organic tapered geometry with bark grooves
          const branchGeo = createOrganicBranchGeometry(
            b.curve,
            b.radiusStart,
            b.radiusEnd,
            localProgress,
            b.isTrunk ? 20 : 12,
            b.isTrunk
          );

          // Apply soft branch sway
          const tipPoint = b.curve.getPoint(1);
          const heightRatio = Math.max(0, tipPoint.y / 3.5);
          const swayX = treeSway.x * heightRatio * 0.4;
          const swayZ = treeSway.z * heightRatio * 0.4;

          return (
            <mesh
              key={`branch-${idx}`}
              geometry={branchGeo}
              material={barkMaterial}
              position={[swayX, 0, swayZ]}
              castShadow
              receiveShadow
            />
          );
        })}
    </group>
  );
}
