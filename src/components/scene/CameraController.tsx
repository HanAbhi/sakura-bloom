'use client';

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { SakuraStage } from '@/lib/animation';

interface CameraControllerProps {
  stage: SakuraStage;
  globalProgress: number; // 0 to 1
  reducedMotion?: boolean;
}

export function CameraController({ stage, globalProgress, reducedMotion = false }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Target coordinates for camera position and lookAt target
  const targetCamPos = useRef(new THREE.Vector3(0, 3.8, 3.4));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.1, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.1, 0));

  // Update target coordinates based on stage & growth progress
  useEffect(() => {
    if (stage === SakuraStage.SEED) {
      // Intimate overhead angle on the dormant seed
      gsap.to(targetCamPos.current, {
        x: 0,
        y: 3.6,
        z: 3.2,
        duration: 2.2,
        ease: 'power2.out',
      });
      gsap.to(targetLookAt.current, {
        x: 0,
        y: 0.05,
        z: 0,
        duration: 2.2,
        ease: 'power2.out',
      });
    } else {
      // Cinematic pullback & pan up to encompass the majestic mature tree
      const progressFactor = Math.min(1, globalProgress * 1.3);
      const camY = 3.6 - progressFactor * 1.2 + progressFactor * 0.4;
      const camZ = 3.2 + progressFactor * 2.8;
      const lookY = 0.05 + progressFactor * 1.65;

      gsap.to(targetCamPos.current, {
        x: 0.4 * Math.sin(progressFactor * Math.PI),
        y: camY,
        z: camZ,
        duration: 1.8,
        ease: 'power1.out',
      });
      gsap.to(targetLookAt.current, {
        x: 0,
        y: lookY,
        z: 0,
        duration: 1.8,
        ease: 'power1.out',
      });
    }
  }, [stage, globalProgress]);

  // Frame update with silky smooth lerp
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Only auto-lerp if user is not actively interacting
    if (!(controlsRef.current as any).state || (controlsRef.current as any).state === -1) {
      // Smooth lerp camera position towards target
      camera.position.lerp(targetCamPos.current, 0.04);
      currentLookAt.current.lerp(targetLookAt.current, 0.04);
      controlsRef.current.target.copy(currentLookAt.current);
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={1.8}
      maxDistance={9.5}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going beneath platform
      minPolarAngle={0.2}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      autoRotate={stage === SakuraStage.FULL_BLOOM && !reducedMotion}
      autoRotateSpeed={0.35}
    />
  );
}

