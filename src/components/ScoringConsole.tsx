"use client";

import React, { useState } from "react";
import { Match, BallRecord, ExtraType, ShotZone } from "@/types/cricket";
import { BallInput } from "@/utils/engine";
import { sounds } from "@/utils/audio";
import { RotateCcw, AlertTriangle, Compass, ShieldAlert, Check } from "lucide-react";

interface ScoringConsoleProps {
  match: Match;
  onRecordBall: (input: BallInput) => void;
  onUndo: () => void;
  onOpenWicketModal: () => void;
  onOpenBowlerModal: () => void;
  onOpenShotZoneModal: () => void;
  activeShotZone?: ShotZone;
  onClearShotZone?: () => void;
}

export default function ScoringConsole({
  match,
  onRecordBall,
  onUndo,
  onOpenWicketModal,
  onOpenBowlerModal,
  onOpenShotZoneModal,
  activeShotZone,
  onClearShotZone,
}: ScoringConsoleProps) {
  const inn = match.innings[match.currentInningsIndex];
  const [selectedExtra, setSelectedExtra] = useState<ExtraType>("none");
  const [extraCustomRuns, setExtraCustomRuns] = useState<number>(0);
  const [showExtrasSubmenu, setShowExtrasSubmenu] = useState<boolean>(false);

  // If match completed, show disabled state
  const isMatchOver = match.status === "completed" || match.status === "innings_break";

  // Recent balls from current innings
  const recentBalls = inn.ballHistory.slice(-14);

  // Handler for standard runs (0, 1, 2, 3, 4, 6)
  const handleScoreRuns = (runs: number) => {
    if (isMatchOver) return;

    sounds.vibrate(40);
    if (runs === 0) sounds.playDot();
    else if (runs === 4) sounds.playFour();
    else if (runs === 6) sounds.playSix();
    else sounds.playRun(runs);

    onRecordBall({
      runsOffBat: runs,
      extraType: "none",
      extraRuns: 0,
      isWicket: false,
      shotZone: activeShotZone,
    });

    if (onClearShotZone) onClearShotZone();
  };

  // Handler for extras
  const handleScoreExtra = (extraType: ExtraType, extraRuns: number = 0, runsOffBat: number = 0) => {
    if (isMatchOver) return;

    sounds.vibrate(50);
    sounds.playRun(1 + extraRuns);

    onRecordBall({
      runsOffBat,
      extraType,
      extraRuns,
      isWicket: false,
      shotZone: activeShotZone,
    });

    setShowExtrasSubmenu(false);
    setSelectedExtra("none");
    setExtraCustomRuns(0);
    if (onClearShotZone) onClearShotZone();
  };

  // Helper badge style for recent balls
  const getBallBadgeClass = (b: BallRecord) => {
    if (b.isWicket) return "ball-wicket";
    if (b.runsOffBat === 6) return "ball-six";
    if (b.runsOffBat === 4) return "ball-four";
    if (b.extraType !== "none") return "ball-extra";
    if (b.runsOffBat > 0) return "ball-run";
    return "ball-dot";
  };

  const getBallLabel = (b: BallRecord) => {
    if (b.isWicket) return "W";
    if (b.extraType === "wide") return b.extraRuns > 0 ? `Wd+${b.extraRuns}` : "Wd";
    if (b.extraType === "no_ball") return b.runsOffBat > 0 ? `Nb+${b.runsOffBat}` : "Nb";
    if (b.extraType === "bye") return `${b.extraRuns}B`;
    if (b.extraType === "leg_bye") return `${b.extraRuns}LB`;
    return `${b.runsOffBat}`;
  };

  // Calculate current over runs
  const currentOverNumber = Math.floor(inn.balls / match.settings.ballsPerOver);
  const currentOverBalls = inn.ballHistory.filter((b) => b.overNumber === currentOverNumber);
  const currentOverRuns = currentOverBalls.reduce((acc, b) => acc + b.totalRuns, 0);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-white shadow-xl">
      {/* Recent Balls Strip */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            Recent Deliveries
          </span>
          <span className="font-mono text-emerald-400 font-medium">
            This Over:{" "}
            <strong className="text-white">
              {currentOverRuns} run{currentOverRuns === 1 ? "" : "s"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar scroll-smooth">
          {recentBalls.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-1">Innings in progress... tap any run below to score</div>
          ) : (
            recentBalls.map((b, idx) => {
              const isOverEnd = b.isLegal && b.ballInOver === match.settings.ballsPerOver;
              return (
                <React.Fragment key={b.id || idx}>
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${getBallBadgeClass(
                      b
                    )}`}
                    title={`${b.commentary}`}
                  >
                    {getBallLabel(b)}
                  </div>
                  {isOverEnd && (
                    <div className="h-6 w-0.5 bg-slate-700/80 mx-1 rounded shrink-0" />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Optional Shot Placement Tag active indicator */}
      {activeShotZone && (
        <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-200">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Shot Tagged: <strong className="uppercase text-emerald-300">{activeShotZone.replace("_", " ")}</strong>
          </span>
          <button
            onClick={onClearShotZone}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Main Runs Keypad - Giant Touch Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 0 Dot */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(0)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-extrabold text-2xl flex flex-col items-center justify-center tap-btn shadow-md disabled:opacity-40"
        >
          <span>0</span>
          <span className="text-[10px] text-slate-400 font-normal uppercase">Dot</span>
        </button>

        {/* 1 Single */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(1)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-extrabold text-2xl flex flex-col items-center justify-center tap-btn shadow-md disabled:opacity-40"
        >
          <span>1</span>
          <span className="text-[10px] text-slate-400 font-normal uppercase">Single</span>
        </button>

        {/* 2 Double */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(2)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-extrabold text-2xl flex flex-col items-center justify-center tap-btn shadow-md disabled:opacity-40"
        >
          <span>2</span>
          <span className="text-[10px] text-slate-400 font-normal uppercase">Two</span>
        </button>

        {/* 3 Three */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(3)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-extrabold text-2xl flex flex-col items-center justify-center tap-btn shadow-md disabled:opacity-40"
        >
          <span>3</span>
          <span className="text-[10px] text-slate-400 font-normal uppercase">Three</span>
        </button>

        {/* 4 FOUR - Prominent Electric Blue */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(4)}
          className="h-14 sm:h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 border border-blue-400/50 text-white font-black text-2xl sm:text-3xl flex flex-col items-center justify-center tap-btn shadow-lg shadow-blue-600/30 disabled:opacity-40"
        >
          <span>4</span>
          <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Four</span>
        </button>

        {/* 6 SIXER - Royal Purple & Gold */}
        <button
          disabled={isMatchOver}
          onClick={() => handleScoreRuns(6)}
          className="h-14 sm:h-16 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-400/60 text-white font-black text-2xl sm:text-3xl flex flex-col items-center justify-center tap-btn shadow-lg shadow-purple-600/30 disabled:opacity-40"
        >
          <span>6</span>
          <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Six!</span>
        </button>
      </div>

      {/* Extras Quick Row */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-5 gap-2">
          {/* Wide */}
          <button
            disabled={isMatchOver}
            onClick={() => handleScoreExtra("wide", 0)}
            className="py-2 sm:py-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm tap-btn disabled:opacity-40"
          >
            +1 WD
          </button>

          {/* No Ball */}
          <button
            disabled={isMatchOver}
            onClick={() => handleScoreExtra("no_ball", 0, 0)}
            className="py-2 sm:py-2.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 font-bold text-xs sm:text-sm tap-btn disabled:opacity-40"
          >
            +1 NB
          </button>

          {/* Bye */}
          <button
            disabled={isMatchOver}
            onClick={() => handleScoreExtra("bye", 1)}
            className="py-2 sm:py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs sm:text-sm tap-btn disabled:opacity-40"
          >
            1 BYE
          </button>

          {/* Leg Bye */}
          <button
            disabled={isMatchOver}
            onClick={() => handleScoreExtra("leg_bye", 1)}
            className="py-2 sm:py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs sm:text-sm tap-btn disabled:opacity-40"
          >
            1 LB
          </button>

          {/* Extras Submenu Trigger */}
          <button
            disabled={isMatchOver}
            onClick={() => setShowExtrasSubmenu(!showExtrasSubmenu)}
            className={`py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition tap-btn ${
              showExtrasSubmenu
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400"
            }`}
          >
            More...
          </button>
        </div>

        {/* Detailed Extras Submenu Drawer */}
        {showExtrasSubmenu && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex flex-col gap-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-semibold text-slate-300">
              Detailed Extras & Boundary Combos:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => handleScoreExtra("wide", 1)}
                className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 tap-btn"
              >
                Wide + 1 Run (2 runs)
              </button>
              <button
                onClick={() => handleScoreExtra("wide", 4)}
                className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 tap-btn"
              >
                Wide + 4 (5 runs)
              </button>
              <button
                onClick={() => handleScoreExtra("no_ball", 0, 4)}
                className="p-2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 tap-btn"
              >
                No Ball + 4 (5 runs)
              </button>
              <button
                onClick={() => handleScoreExtra("no_ball", 0, 6)}
                className="p-2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 tap-btn"
              >
                No Ball + 6 (7 runs)
              </button>
              <button
                onClick={() => handleScoreExtra("bye", 4)}
                className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 tap-btn"
              >
                4 Byes
              </button>
              <button
                onClick={() => handleScoreExtra("leg_bye", 4)}
                className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 tap-btn"
              >
                4 Leg Byes
              </button>
              <button
                onClick={() => handleScoreExtra("penalty", 5)}
                className="p-2 rounded bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 tap-btn"
              >
                +5 Penalty Runs
              </button>
              <button
                onClick={() => setShowExtrasSubmenu(false)}
                className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white tap-btn"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Critical Tactical Actions Row: WICKET, UNDO, FIELD PLACEMENT */}
      <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-800/80">
        {/* OUT / WICKET - Primary Action (6 cols on mobile, 7 cols on sm) */}
        <button
          disabled={isMatchOver}
          onClick={onOpenWicketModal}
          className="col-span-6 sm:col-span-7 h-12 sm:h-13 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 border border-red-400/60 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 tap-btn shadow-lg shadow-red-600/30 disabled:opacity-40"
        >
          <ShieldAlert className="w-5 h-5 text-red-200" />
          <span>OUT / WICKET</span>
        </button>

        {/* Wagon Wheel Shot Tag (3 cols) */}
        <button
          onClick={onOpenShotZoneModal}
          title="Tag shot location for wagon wheel"
          className={`col-span-3 sm:col-span-3 h-12 sm:h-13 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold tap-btn transition ${
            activeShotZone
              ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm"
              : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-300"
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Shot Zone</span>
          <span className="sm:hidden">Zone</span>
        </button>

        {/* Undo Button (3 cols on mobile, 2 cols on sm) */}
        <button
          disabled={inn.ballHistory.length === 0}
          onClick={() => {
            sounds.vibrate(30);
            onUndo();
          }}
          title="Undo last delivery"
          className="col-span-3 sm:col-span-2 h-12 sm:h-13 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 tap-btn disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}
