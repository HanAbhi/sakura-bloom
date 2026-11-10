'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Sparkles, Download, Share2, Check } from 'lucide-react';

interface URLInputProps {
  currentUrl: string;
  onUpdateUrl: (url: string) => void;
  onOpenQRModal: () => void;
  onTapGrow: () => void;
  isGrowing: boolean;
}

export function URLInput({
  currentUrl,
  onUpdateUrl,
  onOpenQRModal,
  onTapGrow,
  isGrowing,
}: URLInputProps) {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onUpdateUrl(inputValue.trim());
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sakura — QR to Living Tree',
          text: 'Watch a living Japanese Sakura tree grow from this digital seed.',
          url: inputValue,
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-zen border border-sakura-blush/40 transition-all focus-within:ring-2 focus-within:ring-sakura/50 hover:bg-white/95"
      >
        {/* Link Icon */}
        <div className="pl-3.5 text-sakura-rose">
          <Link2 className="w-4 h-4 opacity-75" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://njcsb-ocha-party.netlify.app"
          className="w-full bg-transparent px-2 py-1.5 text-sm text-zen-bark font-sans outline-none placeholder:text-zen-stone/60"
        />

        {/* Action: Generate if changed */}
        {inputValue.trim() !== currentUrl && (
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-sakura-rose hover:bg-sakura-plum rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate
          </button>
        )}

        {/* Download QR Modal Trigger */}
        <button
          type="button"
          onClick={onOpenQRModal}
          title="Download High-Res QR"
          className="p-2 text-zen-stone hover:text-sakura-plum hover:bg-sakura-light rounded-full transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Share Button (Signature pill matching reference screenshots) */}
        <button
          type="button"
          onClick={handleShare}
          className="px-4 py-1.5 text-sm font-medium text-white bg-sakura-rose hover:bg-sakura-plum active:scale-95 rounded-full shadow-sm transition-all flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

