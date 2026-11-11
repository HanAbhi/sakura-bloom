'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateQR, QRData, DEFAULT_QR_URL } from '@/lib/qr';
import { useSakuraTimeline } from '@/hooks/useSakuraTimeline';
import { URLInput } from '@/components/ui/URLInput';
import { Controls } from '@/components/ui/Controls';
import { QRPanel } from '@/components/ui/QRPanel';
import { SakuraStage } from '@/lib/animation';
import { BloomMessage } from '@/components/ui/BloomMessage';
import { useGuestMode, pickClosingMessage, ClosingMessage, OCHA_PARTY_URL } from '@/lib/guest';

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
  const { isGuest, reducedMotion, ready } = useGuestMode();
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
    resetToQR,
    replay,
    bloomNow,
    seekStage,
    selectSeason,
    setBreezeIntensity,
    toggleSound,
  } = useSakuraTimeline();

  // Guests who prefer reduced motion skip the growth animation and get a gentler breeze
  const calmGuest = isGuest && reducedMotion;
  const grow = calmGuest ? bloomNow : triggerGrow;

  useEffect(() => {
    if (calmGuest) setBreezeIntensity(0.4);
  }, [calmGuest, setBreezeIntensity]);

  // A new closing message each time the tree reaches full bloom (guest mode only)
  useEffect(() => {
    if (!isGuest) return;
    if (stage === SakuraStage.FULL_BLOOM) {
      setMessage((current) => current ?? pickClosingMessage());
    } else {
      setMessage(null);
    }
  }, [isGuest, stage]);

  const handleReplay = useCallback(() => {
    if (calmGuest) {
      bloomNow();
      setMessage(pickClosingMessage());
    } else {
      replay();
    }
  }, [calmGuest, bloomNow, replay]);

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
          onTapGrow={grow}
          onTapTree={isGuest ? () => {} : resetToQR}
          guestMode={isGuest}
          reducedMotion={calmGuest}
        />
      </div>

      {/* 2. Closing message (guest mode, full bloom) */}
      {isGuest && <BloomMessage message={message} reducedMotion={calmGuest} />}

      {/* 3. Floating Bottom Controls (the URL editor and download tools are hidden for guests) */}
      {ready && (
        <footer className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-2">
          {!isGuest && (
            <div className="pointer-events-auto w-full">
              <URLInput
                currentUrl={targetUrl}
                onUpdateUrl={handleUpdateUrl}
                onOpenQRModal={() => setIsQRModalOpen(true)}
                onTapGrow={triggerGrow}
                isGrowing={isPlaying}
              />
            </div>
          )}

          <div className="pointer-events-auto w-full">
            <Controls
              stage={stage}
              season={season}
              soundEnabled={soundEnabled}
              onSelectSeason={selectSeason}
              onToggleSound={toggleSound}
              onReplay={isGuest ? handleReplay : replay}
              onResetToQR={resetToQR}
              onTapGrow={grow}
              isGrowing={isPlaying}
              guestMode={isGuest}
            />
          </div>

          {isGuest && (
            <a
              href={OCHA_PARTY_URL}
              className="pointer-events-auto -mt-3 mb-4 px-3 py-2 font-serif text-xs text-zen-bark/70 underline underline-offset-4 decoration-sakura-blush hover:text-sakura-plum"
              style={{ marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              Back to the Ocha Party
            </a>
          )}
        </footer>
      )}

      {/* 4. High-Resolution QR Modal */}
      {!isGuest && (
        <QRPanel
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          qrData={qrData}
          targetUrl={targetUrl}
        />
      )}
    </main>
  );
}

