"use client";

import React, { useEffect } from "react";
import { Sparkles, Trophy, Flame } from "lucide-react";

interface CelebrationToastProps {
  message: string;
  type: "four" | "six" | "fifty" | "century" | "wicket" | "win";
  onClose: () => void;
}

export default function CelebrationToast({
  message,
  type,
  onClose,
}: CelebrationToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    switch (type) {
      case "six":
        return "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 border-purple-400 text-white shadow-purple-500/30";
      case "four":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-blue-500/30";
      case "fifty":
      case "century":
        return "bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 border-yellow-300 text-slate-950 shadow-amber-500/40";
      case "wicket":
        return "bg-gradient-to-r from-red-600 to-rose-700 border-red-400 text-white shadow-red-500/30";
      case "win":
        return "bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 border-emerald-300 text-white shadow-emerald-500/40";
      default:
        return "bg-slate-800 border-slate-700 text-white";
    }
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200 px-4 w-full max-w-md">
      <div
        className={`rounded-2xl p-3.5 border shadow-2xl flex items-center gap-3 backdrop-blur-md ${getStyle()}`}
      >
        <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
          {type === "win" ? (
            <Trophy className="w-5 h-5 text-amber-300" />
          ) : type === "six" ? (
            <Flame className="w-5 h-5 text-amber-300" />
          ) : (
            <Sparkles className="w-5 h-5 text-yellow-200" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-extrabold tracking-tight truncate">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
