'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSakuraTimeline } from '@/hooks/useSakuraTimeline';
import { Controls } from '@/components/ui/Controls';
import { SakuraStage } from '@/lib/animation';
import { BloomMessage } from '@/components/ui/BloomMessage';
import { useReducedMotion, pickClosingMessage, ClosingMessage, OCHA_PARTY_URL } from '@/lib/guest';

// Dynamically import 3D canvas scene with SSR disabled for optimal Three.js rendering
const SakuraScene = dynamic(
  () => import('@/components/scene/SakuraScene').then((mod) => mod.SakuraScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F0EA]">
        <div className="w-12 h-12 rounded-full border-2 border-sakura-rose/30 border-t-sakura-rose animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-zen-bark/60 font-serif">
          Cultivating Zen Garden...
        </span>
      </div>
    ),
  }
);

export default function SakuraApp() {
  const reducedMotion = useReducedMotion();
  const [message, setMessage] = useState<ClosingMessage | null>(null);

  const {
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
    replay,
    bloomNow,
    selectSeason,
    toggleSound,
  } = useSakuraTimeline();

  // Guests who prefer reduced motion skip the growth animation and get a gentler breeze
  const grow = reducedMotion ? bloomNow : triggerGrow;
  const breeze = reducedMotion ? breezeIntensity * 0.4 : breezeIntensity;

  // A new message each time the tree reaches full bloom
  useEffect(() => {
    if (stage === SakuraStage.FULL_BLOOM) {
      setMessage((current) => current ?? pickClosingMessage());
    } else {
      setMessage(null);
    }
  }, [stage]);

  const handleReplay = useCallback(() => {
    if (reducedMotion) {
      bloomNow();
      setMessage(pickClosingMessage());
    } else {
      replay();
    }
  }, [reducedMotion, bloomNow, replay]);

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-[#F8F0EA]">
      {/* 1. Fullscreen 3D Sakura Experience Canvas */}
      <div className="absolute inset-0 z-0">
        <SakuraScene
          stage={stage}
          globalProgress={globalProgress}
          activationProgress={activationProgress}
          germinationProgress={germinationProgress}
          growthProgress={growthProgress}
          blossomProgress={blossomProgress}
          blossomDensity={blossomDensity}
          breezeIntensity={breeze}
          onTapGrow={grow}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* 2. Message at full bloom */}
      <BloomMessage message={message} reducedMotion={reducedMotion} />

      {/* 3. Floating Bottom Controls */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-2">
        <div className="pointer-events-auto w-full">
          <Controls
            stage={stage}
            season={season}
            soundEnabled={soundEnabled}
            onSelectSeason={selectSeason}
            onToggleSound={toggleSound}
            onReplay={handleReplay}
            onTapGrow={grow}
            isGrowing={isPlaying}
            reducedMotion={reducedMotion}
          />
        </div>

        <a
          href={OCHA_PARTY_URL}
          className="pointer-events-auto -mt-3 mb-4 px-3 py-2 font-serif text-xs text-zen-bark/70 underline underline-offset-4 decoration-sakura-blush hover:text-sakura-plum"
          style={{ marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          Back to the Ocha Party
        </a>
      </footer>
    </main>
  );
}
