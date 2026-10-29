"use client";

import React from "react";
import { ShotZone } from "@/types/cricket";
import { X, Compass, Check } from "lucide-react";

interface ShotZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone?: ShotZone;
  onSelectZone: (zone: ShotZone) => void;
}

const zones: { id: ShotZone; name: string; angle: number; color: string }[] = [
  { id: "straight", name: "Straight / Down the Ground", angle: 0, color: "#38bdf8" },
  { id: "long_off", name: "Long Off", angle: 45, color: "#818cf8" },
  { id: "cover", name: "Cover / Extra Cover", angle: 90, color: "#34d399" },
  { id: "point", name: "Point / Backward Point", angle: 135, color: "#fbbf24" },
  { id: "third_man", name: "Third Man", angle: 180, color: "#f87171" },
  { id: "fine_leg", name: "Fine Leg", angle: 225, color: "#fb923c" },
  { id: "square_leg", name: "Square Leg", angle: 270, color: "#f472b6" },
  { id: "mid_wicket", name: "Mid-Wicket", angle: 315, color: "#a78bfa" },
  { id: "long_on", name: "Long On", angle: 340, color: "#2dd4bf" },
];

export default function ShotZoneModal({
  isOpen,
  onClose,
  selectedZone,
  onSelectZone,
}: ShotZoneModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d1624] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Tag Shot Direction (Wagon Wheel)</h2>
              <p className="text-xs text-slate-400">Select where the ball was played on the ground</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Cricket Ground Representation */}
        <div className="relative w-64 h-64 mx-auto my-2 rounded-full border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950 via-[#072418] to-emerald-950 flex items-center justify-center shadow-inner overflow-hidden">
          {/* 30 yard circle */}
          <div className="absolute w-40 h-40 rounded-full border border-dashed border-emerald-400/30 pointer-events-none" />
          {/* Pitch */}
          <div className="absolute w-5 h-16 bg-amber-200/30 border border-amber-300/40 rounded-sm pointer-events-none" />

          {/* Slices representation buttons */}
          {zones.map((z) => {
            const isSelected = selectedZone === z.id;
            // Position on circle perimeter
            const rad = ((z.angle - 90) * Math.PI) / 180;
            const radius = 95; // px from center
            const left = 128 + radius * Math.cos(rad);
            const top = 128 + radius * Math.sin(rad);

            return (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  onSelectZone(z.id);
                  onClose();
                }}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight transition tap-btn shadow-md whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-400 text-slate-950 ring-2 ring-white scale-110"
                    : "bg-slate-900/90 text-slate-200 border border-emerald-500/40 hover:bg-emerald-500/20"
                }`}
              >
                {z.name.split("/")[0].trim()}
              </button>
            );
          })}
        </div>

        {/* List of Zones */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {zones.map((z) => {
            const isSelected = selectedZone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  onSelectZone(z.id);
                  onClose();
                }}
                className={`p-2 rounded-lg border text-left flex items-center justify-between gap-1 transition tap-btn ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/70"
                }`}
              >
                <span className="truncate">{z.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold tap-btn"
          >
            Skip / Close
          </button>
        </div>
      </div>
    </div>
  );
}
