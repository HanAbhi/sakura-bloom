'use client';

import React from 'react';
import { X, Download, Copy, ExternalLink, Check, Sparkles } from 'lucide-react';
import { QRData } from '@/lib/qr';

interface QRPanelProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: QRData | null;
  targetUrl: string;
}

export function QRPanel({ isOpen, onClose, qrData, targetUrl }: QRPanelProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !qrData) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrData.dataURL;
    link.download = `sakura-seed-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zen-barkDark/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm p-6 bg-ivory-50 rounded-3xl shadow-zen-lg border border-sakura-blush/60 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zen-stone hover:text-sakura-plum hover:bg-sakura-light rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Japanese Title */}
        <div className="text-center mb-4">
          <span className="text-[10px] uppercase tracking-widest text-sakura-rose font-semibold block">
            Digital Seed
          </span>
          <h3 className="text-lg font-serif font-medium text-zen-bark">
            桜 — Sakura QR Code
          </h3>
          <p className="text-xs text-zen-stone mt-0.5">
            Scan to awaken the living cherry tree
          </p>
        </div>

        {/* QR Code Container with Japanese border styling */}
        <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-sakura-blush/40 mb-4 group">
          <img
            src={qrData.dataURL}
            alt="Sakura QR Code"
            className="w-56 h-56 rounded-xl object-contain"
          />
          {/* Subtle center flower stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-white/90 border border-sakura shadow-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sakura-rose" />
            </div>
          </div>
        </div>

        {/* Destination link display */}
        <div className="w-full flex items-center justify-between p-2.5 mb-4 bg-white/70 rounded-xl border border-sakura-blush/30 text-xs text-zen-bark">
          <span className="truncate max-w-[200px] text-zen-stone">{targetUrl}</span>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sakura-rose hover:text-sakura-plum p-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 bg-sakura-rose hover:bg-sakura-plum text-white text-xs font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-2.5 px-4 bg-white hover:bg-sakura-light text-zen-bark text-xs font-medium rounded-xl border border-sakura-blush/50 transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-sakura-rose" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zen-stone" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

