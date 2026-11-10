'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateQR, QRData, DEFAULT_QR_URL } from '@/lib/qr';
import { useSakuraTimeline } from '@/hooks/useSakuraTimeline';
import { URLInput } from '@/components/ui/URLInput';
import { Controls } from '@/components/ui/Controls';
import { QRPanel } from '@/components/ui/QRPanel';
import { SakuraStage } from '@/lib/animation';

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
  const [targetUrl, setTargetUrl] = useState<string>(DEFAULT_QR_URL);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

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
    resetToQR,
    replay,
    seekStage,
    selectSeason,
    toggleSound,
  } = useSakuraTimeline();

  // Generate QR matrix whenever targetUrl changes
  useEffect(() => {
    let active = true;
    generateQR(targetUrl).then((data) => {
      if (active) {
        setQrData(data);
      }
    });
    return () => {
      active = false;
    };
  }, [targetUrl]);

  const handleUpdateUrl = useCallback(
    (newUrl: string) => {
      setTargetUrl(newUrl);
      // If tree was already grown, gently reset so user can see their new QR
      if (stage !== SakuraStage.QR_IDLE) {
        resetToQR();
      }
    },
    [stage, resetToQR]
  );

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F8F0EA]">
      {/* 1. Fullscreen 3D Sakura Experience Canvas */}
      <div className="absolute inset-0 z-0">
        <SakuraScene
          qrData={qrData}
          targetUrl={targetUrl}
          stage={stage}
          globalProgress={globalProgress}
          activationProgress={activationProgress}
          germinationProgress={germinationProgress}
          growthProgress={growthProgress}
          blossomProgress={blossomProgress}
          blossomDensity={blossomDensity}
          breezeIntensity={breezeIntensity}
          onTapGrow={triggerGrow}
          onTapTree={resetToQR}
        />
      </div>

      {/* 2. Floating Bottom Controls & URL Input */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-2">
        <div className="pointer-events-auto w-full">
          <URLInput
            currentUrl={targetUrl}
            onUpdateUrl={handleUpdateUrl}
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onTapGrow={triggerGrow}
            isGrowing={isPlaying}
          />
        </div>

        <div className="pointer-events-auto w-full">
          <Controls
            stage={stage}
            season={season}
            soundEnabled={soundEnabled}
            onSelectSeason={selectSeason}
            onToggleSound={toggleSound}
            onReplay={replay}
            onResetToQR={resetToQR}
            onTapGrow={triggerGrow}
            isGrowing={isPlaying}
          />
        </div>
      </footer>

      {/* 4. High-Resolution QR Modal */}
      <QRPanel
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        qrData={qrData}
        targetUrl={targetUrl}
      />
    </main>
  );
}

