'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { SakuraStage } from '@/lib/animation';
import { zenAudio } from '@/lib/audio';

export type SeasonMode = 'spring' | 'bloom' | 'breeze';

export function useSakuraTimeline() {
  const [stage, setStage] = useState<SakuraStage>(SakuraStage.QR_IDLE);
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  const [season, setSeason] = useState<SeasonMode>('spring');
  const [blossomDensity, setBlossomDensity] = useState<number>(1.0);
  const [breezeIntensity, setBreezeIntensity] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // GSAP tween tracking object
  const timelineRef = useRef<gsap.core.Tween | null>(null);
  const progressObj = useRef<{ value: number }>({ value: 0 });

  // Compute sub-stage progresses from global progress (0.0 to 1.0)
  // Stage 0: [0.00, 0.05]
  // Stage 1 (Activation): [0.05, 0.22]
  // Stage 2 (Germination): [0.20, 0.42]
  // Stage 3 (Tree Growth): [0.38, 0.72]
  // Stage 4 (Blossoming): [0.65, 0.95]
  // Stage 5 (Full Bloom): [0.95, 1.00]
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const remap = (v: number, min: number, max: number) => clamp01((v - min) / (max - min));

  const activationProgress = remap(globalProgress, 0.05, 0.25);
  const germinationProgress = remap(globalProgress, 0.20, 0.45);
  const growthProgress = remap(globalProgress, 0.38, 0.75);
  const blossomProgress = remap(globalProgress, 0.65, 0.98);

  const updateStageFromProgress = useCallback((val: number) => {
    if (val < 0.05) {
      setStage(SakuraStage.QR_IDLE);
    } else if (val < 0.25) {
      setStage(SakuraStage.ACTIVATION);
    } else if (val < 0.45) {
      setStage(SakuraStage.GERMINATION);
    } else if (val < 0.75) {
      setStage(SakuraStage.TREE_GROWTH);
    } else if (val < 0.95) {
      setStage(SakuraStage.BLOSSOMING);
    } else {
      setStage(SakuraStage.FULL_BLOOM);
    }
  }, []);

  // Main growth animation: Smooth 8.5s continuous cinematic transition
  const triggerGrow = useCallback(() => {
    if (timelineRef.current) timelineRef.current.kill();
    setIsPlaying(true);
    
    // Play authentic Japanese Koto flourish on awakening
    zenAudio.playFlourish();

    timelineRef.current = gsap.to(progressObj.current, {
      value: 1.0,
      duration: 8.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = progressObj.current.value;
        setGlobalProgress(val);
        updateStageFromProgress(val);
      },
      onComplete: () => {
        setIsPlaying(false);
        setStage(SakuraStage.FULL_BLOOM);
        zenAudio.playChime(880.0, 5.0);
      },
    });
  }, [updateStageFromProgress]);

  // Return to QR Code: Smooth 2.5s reversal
  const resetToQR = useCallback(() => {
    if (timelineRef.current) timelineRef.current.kill();
    setIsPlaying(true);

    zenAudio.playChime(523.25, 2.5);

    timelineRef.current = gsap.to(progressObj.current, {
      value: 0.0,
      duration: 2.8,
      ease: 'power2.out',
      onUpdate: () => {
        const val = progressObj.current.value;
        setGlobalProgress(val);
        updateStageFromProgress(val);
      },
      onComplete: () => {
        setIsPlaying(false);
        setStage(SakuraStage.QR_IDLE);
      },
    });
  }, [updateStageFromProgress]);

  // Replay: Rewind to 0 and immediately grow
  const replay = useCallback(() => {
    if (timelineRef.current) timelineRef.current.kill();
    progressObj.current.value = 0;
    setGlobalProgress(0);
    setStage(SakuraStage.QR_IDLE);
    setTimeout(() => {
      triggerGrow();
    }, 150);
  }, [triggerGrow]);

  // Jump straight to full bloom with no growth animation (used for "Reduce motion")
  const bloomNow = useCallback(() => {
    if (timelineRef.current) timelineRef.current.kill();
    progressObj.current.value = 1.0;
    setGlobalProgress(1.0);
    setStage(SakuraStage.FULL_BLOOM);
    setIsPlaying(false);
    zenAudio.playChime(880.0, 5.0);
  }, []);

  // Seek to specific stage
  const seekStage = useCallback((targetStage: SakuraStage) => {
    if (timelineRef.current) timelineRef.current.kill();
    let targetProgress = 0;
    switch (targetStage) {
      case SakuraStage.QR_IDLE: targetProgress = 0.0; break;
      case SakuraStage.ACTIVATION: targetProgress = 0.15; break;
      case SakuraStage.GERMINATION: targetProgress = 0.35; break;
      case SakuraStage.TREE_GROWTH: targetProgress = 0.60; break;
      case SakuraStage.BLOSSOMING: targetProgress = 0.85; break;
      case SakuraStage.FULL_BLOOM: targetProgress = 1.0; break;
    }

    timelineRef.current = gsap.to(progressObj.current, {
      value: targetProgress,
      duration: 2.0,
      ease: 'power2.out',
      onUpdate: () => {
        const val = progressObj.current.value;
        setGlobalProgress(val);
        updateStageFromProgress(val);
      },
      onComplete: () => {
        setIsPlaying(false);
        setStage(targetStage);
      }
    });
  }, [updateStageFromProgress]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    const isMutedNow = zenAudio.toggleMute();
    setSoundEnabled(!isMutedNow);
  }, []);

  // Update breeze and blossom presets based on season
  const selectSeason = useCallback((mode: SeasonMode) => {
    setSeason(mode);
    if (mode === 'spring') {
      setBlossomDensity(1.0);
      setBreezeIntensity(1.0);
    } else if (mode === 'bloom') {
      setBlossomDensity(1.8);
      setBreezeIntensity(0.8);
      zenAudio.playChime(783.99, 3.0);
    } else if (mode === 'breeze') {
      setBlossomDensity(1.2);
      setBreezeIntensity(2.4);
      zenAudio.playChime(1046.5, 3.5);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  return {
    stage,
    globalProgress,
    activationProgress,
    germinationProgress,
    growthProgress,
    blossomProgress,
    season,
    blossomDensity,
    breezeIntensity,
    soundEnabled,
    isPlaying,
    triggerGrow,
    resetToQR,
    replay,
    bloomNow,
    seekStage,
    selectSeason,
    setBlossomDensity,
    setBreezeIntensity,
    toggleSound,
  };
}

