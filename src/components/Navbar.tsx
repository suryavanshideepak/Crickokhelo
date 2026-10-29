"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  PlusCircle,
  FolderOpen,
  Share2,
  Sparkles,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { sounds } from "@/utils/audio";

interface NavbarProps {
  matchTitle: string;
  onNewMatch: () => void;
  onOpenArchive: () => void;
  onOpenShare: () => void;
  onLoadDemo: () => void;
  onResetMatch: () => void;
}

export default function Navbar({
  matchTitle,
  onNewMatch,
  onOpenArchive,
  onOpenShare,
  onLoadDemo,
  onResetMatch,
}: NavbarProps) {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070d14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <span className="text-xl">🏏</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white truncate">
                OpenCricket<span className="text-emerald-400 font-extrabold">.Pro</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Open Source
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {matchTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? "Unmute Audio Effects" : "Mute Audio Effects"}
            className={`p-2 rounded-lg transition-all tap-btn ${
              isMuted
                ? "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Demo Match */}
          <button
            onClick={onLoadDemo}
            title="Load Thriller Demo Match"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition tap-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Match</span>
          </button>

          {/* Saved Matches Archive */}
          <button
            onClick={onOpenArchive}
            title="Saved Matches"
            className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition tap-btn"
          >
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          {/* Share / Export */}
          <button
            onClick={onOpenShare}
            title="Share & Export Scorecard"
            className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition tap-btn"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* New Match */}
          <button
            onClick={onNewMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition tap-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Match</span>
          </button>
        </div>
      </div>
    </header>
  );
}
