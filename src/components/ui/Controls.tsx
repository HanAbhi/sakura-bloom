'use client';

import React from 'react';
import { Volume2, VolumeX, RotateCcw, QrCode, Flower2, Wind, Sparkles } from 'lucide-react';
import { SakuraStage } from '@/lib/animation';
import { SeasonMode } from '@/hooks/useSakuraTimeline';

interface ControlsProps {
  stage: SakuraStage;
  season: SeasonMode;
  soundEnabled: boolean;
  onSelectSeason: (season: SeasonMode) => void;
  onToggleSound: () => void;
  onReplay: () => void;
  onResetToQR: () => void;
  onTapGrow: () => void;
  isGrowing: boolean;
  guestMode?: boolean;
}

export function Controls({
  stage,
  season,
  soundEnabled,
  onSelectSeason,
  onToggleSound,
  onReplay,
  onResetToQR,
  onTapGrow,
  isGrowing,
  guestMode = false,
}: ControlsProps) {
  const isQR = stage === SakuraStage.QR_IDLE;
  const isFullBloom = stage === SakuraStage.FULL_BLOOM;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto px-4 pb-6">
      {/* 1. Interactive Center Action Pill */}
      {isQR && (
        <button
          onClick={onTapGrow}
          disabled={isGrowing}
          className="group px-6 py-2.5 bg-white/90 hover:bg-white text-sakura-rose hover:text-sakura-plum font-sans font-medium text-sm rounded-full shadow-zen hover:shadow-zen-lg border border-sakura-blush/60 transition-all flex items-center gap-2 animate-pulse hover:animate-none active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-sakura-rose group-hover:rotate-12 transition-transform" />
          <span>Tap to see the tree</span>
        </button>
      )}

      {isFullBloom && !guestMode && (
        <button
          onClick={onResetToQR}
          className="px-6 py-2.5 bg-white/90 hover:bg-white text-sakura-plum font-sans font-medium text-sm rounded-full shadow-zen hover:shadow-zen-lg border border-sakura-blush/60 transition-all flex items-center gap-2 active:scale-95"
        >
          <QrCode className="w-4 h-4 text-sakura-rose" />
          <span>Tap to see QR code</span>
        </button>
      )}

      {/* 2. Main Minimal Japanese Control Bar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-zen border border-sakura-blush/40 transition-all">
        {/* Spring Mode */}
        <button
          type="button"
          onClick={() => onSelectSeason('spring')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            season === 'spring'
              ? 'bg-white text-sakura-plum shadow-sm ring-1 ring-sakura-blush'
              : 'text-zen-bark hover:text-sakura-rose hover:bg-sakura-light/50'
          }`}
        >
          <Flower2 className={`w-3.5 h-3.5 ${season === 'spring' ? 'text-sakura-rose' : 'opacity-70'}`} />
          <span>Spring</span>
        </button>

        {/* Bloom Mode */}
        <button
          type="button"
          onClick={() => onSelectSeason('bloom')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            season === 'bloom'
              ? 'bg-white text-sakura-plum shadow-sm ring-1 ring-sakura-blush'
              : 'text-zen-bark hover:text-sakura-rose hover:bg-sakura-light/50'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${season === 'bloom' ? 'text-sakura-vibrant' : 'opacity-70'}`} />
          <span>Bloom</span>
        </button>

        {/* Breeze Mode */}
        <button
          type="button"
          onClick={() => onSelectSeason('breeze')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            season === 'breeze'
              ? 'bg-white text-sakura-plum shadow-sm ring-1 ring-sakura-blush'
              : 'text-zen-bark hover:text-sakura-rose hover:bg-sakura-light/50'
          }`}
        >
          <Wind className={`w-3.5 h-3.5 ${season === 'breeze' ? 'text-sakura-rose' : 'opacity-70'}`} />
          <span>Breeze</span>
        </button>

        <div className="w-[1px] h-4 bg-sakura-blush/40 my-auto mx-0.5" />

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Zen Audio' : 'Play Ambient Wind & Chimes'}
          className={`p-2 rounded-full transition-all ${
            soundEnabled
              ? 'text-sakura-plum bg-sakura-light ring-1 ring-sakura-blush/60'
              : 'text-zen-stone hover:text-sakura-rose hover:bg-sakura-light/40'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-sakura-rose" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Replay Transformation */}
        <button
          type="button"
          onClick={onReplay}
          title="Replay QR-to-Tree Awakening"
          className="p-2 text-zen-stone hover:text-sakura-plum hover:bg-sakura-light/40 rounded-full transition-all active:rotate-180"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Return to QR code if in tree mode */}
        {!isQR && !guestMode && (
          <button
            type="button"
            onClick={onResetToQR}
            title="Return to Scannable QR Code"
            className="p-2 text-zen-stone hover:text-sakura-plum hover:bg-sakura-light/40 rounded-full transition-all"
          >
            <QrCode className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

