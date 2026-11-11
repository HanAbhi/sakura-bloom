'use client';

import React from 'react';
import { ClosingMessage } from '@/lib/guest';

interface BloomMessageProps {
  message: ClosingMessage | null;
  reducedMotion: boolean;
}

/** A small card that settles in at the top of the screen once the tree is in full bloom. */
export function BloomMessage({ message, reducedMotion }: BloomMessageProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 flex justify-center px-5 pointer-events-none"
      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      aria-live="polite"
    >
      {message && (
        <div
          key={message.jp}
          className={`${reducedMotion ? 'bloom-message-calm' : 'bloom-message'} w-full max-w-sm px-6 py-5 text-center bg-ivory-50/90 rounded-2xl shadow-zen border border-sakura-blush/60`}
        >
          <p lang="ja" className="font-serif text-2xl tracking-[0.2em] text-sakura-rose">
            {message.jp}
          </p>
          <p className="mt-1 font-serif text-xs italic text-zen-stone">{message.romaji}</p>
          <p className="mt-3 font-serif text-[15px] leading-relaxed text-zen-bark">{message.text}</p>
        </div>
      )}
    </div>
  );
}
