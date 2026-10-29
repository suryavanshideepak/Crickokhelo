"use client";

import React from "react";
import { Match, Innings, Team } from "@/types/cricket";
import { ArrowLeftRight, UserCheck, Flame, Target, Trophy } from "lucide-react";

interface LiveScoreBannerProps {
  match: Match;
  onSwapStrike: () => void;
  onChangeBowler: () => void;
  onOpenBowlerModal: () => void;
}

export default function LiveScoreBanner({
  match,
  onSwapStrike,
  onOpenBowlerModal,
}: LiveScoreBannerProps) {
  const innIndex = match.currentInningsIndex;
  const inn: Innings = match.innings[innIndex];

  const battingTeam: Team =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const bowlingTeam: Team =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  const striker = battingTeam.players.find((p) => p.id === inn.strikerId);
  const nonStriker = battingTeam.players.find((p) => p.id === inn.nonStrikerId);
  const bowler = bowlingTeam.players.find((p) => p.id === inn.currentBowlerId);

  const strikerStats = striker ? inn.batterStats[striker.id] : null;
  const nonStrikerStats = nonStriker ? inn.batterStats[nonStriker.id] : null;
  const bowlerStats = bowler ? inn.bowlerStats[bowler.id] : null;

  // Run rates calculation
  const oversCompleted = Math.floor(inn.balls / match.settings.ballsPerOver);
  const ballsInOver = inn.balls % match.settings.ballsPerOver;
  const totalOversDec = oversCompleted + ballsInOver / match.settings.ballsPerOver;
  const crr = totalOversDec > 0 ? (inn.runs / totalOversDec).toFixed(2) : "0.00";

  // Target & Required run rate
  const isSecondInnings = innIndex === 1 && typeof inn.target === "number";
  const target = inn.target || 0;
  const runsNeeded = Math.max(0, target - inn.runs);
  const totalBallsAllowed = match.settings.maxOvers * match.settings.ballsPerOver;
  const ballsRemaining = Math.max(0, totalBallsAllowed - inn.balls);
  const rrr =
    ballsRemaining > 0
      ? ((runsNeeded / ballsRemaining) * match.settings.ballsPerOver).toFixed(2)
      : "0.00";

  // Strike Rate helper
  const calcSR = (r: number, b: number) => (b > 0 ? ((r / b) * 100).toFixed(1) : "0.0");
  // Bowler Economy helper
  const calcEcon = (r: number, balls: number) =>
    balls > 0 ? ((r / balls) * match.settings.ballsPerOver).toFixed(2) : "0.00";

  return (
    <div className="w-full glass-panel-glow rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
      {/* Decorative background glow accents */}
      <div
        className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: battingTeam.color || "#10b981" }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: bowlingTeam.color || "#38bdf8" }}
      />

      {/* Top Status & Context */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          {match.status === "completed" ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" /> Match Ended
            </span>
          ) : match.status === "innings_break" ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Innings Break
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-live" /> LIVE &bull;{" "}
              {innIndex === 0 ? "1st Innings" : "2nd Innings"}
            </span>
          )}

          <span className="text-xs text-slate-400 font-medium">
            {match.settings.venue} &bull; {match.settings.maxOvers} Overs
          </span>
        </div>

        {/* Toss & summary preview */}
        <div className="text-xs text-slate-400">
          <span className="text-slate-300 font-medium">
            {match.toss.winnerTeamId === match.teams.teamA.id
              ? match.teams.teamA.shortName
              : match.teams.teamB.shortName}
          </span>{" "}
          opted to {match.toss.decision}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Big Score & Overs */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-slate-100">
              <span>{battingTeam.logoEmoji}</span>
              <span>{battingTeam.shortName}</span>
            </span>

            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {inn.runs}
                <span className="text-slate-500 font-light mx-0.5">/</span>
                <span className="text-emerald-400">{inn.wickets}</span>
              </span>
            </div>

            <div className="text-slate-400 text-sm sm:text-base font-medium ml-2">
              <span className="text-slate-200 font-semibold font-mono">
                {oversCompleted}.{ballsInOver}
              </span>
              <span className="text-slate-500"> / {match.settings.maxOvers} ov</span>
            </div>
          </div>

          {/* CRR & Target Status Banner */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm">
            <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono">
              CRR: <strong className="text-white">{crr}</strong>
            </span>

            {isSecondInnings && (
              <>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  RRR: <strong className="text-amber-200">{rrr}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Target: <strong className="text-white">{target}</strong>
                </span>
              </>
            )}
          </div>

          {/* Chase scenario bar */}
          {isSecondInnings && match.status !== "completed" && (
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-amber-300 font-medium truncate">
                <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate">
                  Need <strong className="text-white font-bold">{runsNeeded}</strong> runs from{" "}
                  <strong className="text-white font-bold">{ballsRemaining}</strong> balls
                </span>
              </div>
              <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden shrink-0">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, (inn.runs / target) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Match Result Banner if finished */}
          {match.result && (
            <div className="mt-3 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-emerald-200 text-sm font-semibold shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{match.result.summary}</span>
            </div>
          )}
        </div>

        {/* Right: Innings 1 Summary if in 2nd innings */}
        {innIndex === 1 && (
          <div className="md:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">1st Innings:</span>
              <span className="font-semibold text-slate-200">
                {bowlingTeam.logoEmoji} {bowlingTeam.shortName}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-lg font-bold text-slate-100">
                {match.innings[0].runs}/{match.innings[0].wickets}
              </span>
              <span className="text-slate-400">
                ({Math.floor(match.innings[0].balls / match.settings.ballsPerOver)}.
                {match.innings[0].balls % match.settings.ballsPerOver} ov)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Extras: {match.innings[0].extras.total} (w {match.innings[0].extras.wides}, nb{" "}
              {match.innings[0].extras.noBalls})
            </div>
          </div>
        )}
      </div>

      {/* Batsmen & Bowler Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-3 border-t border-slate-800/80">
        {/* Batsmen Box (7 cols) */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🏏 Batsmen</span>
            </span>
            <button
              onClick={onSwapStrike}
              title="Manually swap striker and non-striker"
              className="text-xs flex items-center gap-1 text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2 py-0.5 rounded-lg transition tap-btn"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Swap Strike</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Striker */}
            <div className="flex items-center justify-between bg-slate-800/70 border border-emerald-500/30 rounded-lg p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {striker?.name || "Striker"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30">
                      * On Strike
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    4s: <strong className="text-slate-200">{strikerStats?.fours || 0}</strong> &bull;{" "}
                    6s: <strong className="text-slate-200">{strikerStats?.sixes || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-base font-extrabold text-white">
                  {strikerStats?.runs || 0}
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    ({strikerStats?.balls || 0})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  SR: {calcSR(strikerStats?.runs || 0, strikerStats?.balls || 0)}
                </div>
              </div>
            </div>

            {/* Non-Striker */}
            <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {nonStriker?.name || "Non-Striker"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    4s: <strong className="text-slate-200">{nonStrikerStats?.fours || 0}</strong>{" "}
                    &bull; 6s:{" "}
                    <strong className="text-slate-200">{nonStrikerStats?.sixes || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <div className="text-base font-semibold text-slate-200">
                  {nonStrikerStats?.runs || 0}
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    ({nonStrikerStats?.balls || 0})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  SR: {calcSR(nonStrikerStats?.runs || 0, nonStrikerStats?.balls || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Bowler Box (5 cols) */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🎯 Current Bowler</span>
            </span>
            <button
              onClick={onOpenBowlerModal}
              title="Change active bowler"
              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition tap-btn"
            >
              <UserCheck className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white truncate">
                {bowler?.name || "Bowler"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {bowlerStats?.wickets || 0} / {bowlerStats?.runsConceded || 0}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs pt-1 border-t border-slate-700/50">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">O</span>
                <span className="font-bold text-slate-200">{bowlerStats?.overs || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">M</span>
                <span className="font-bold text-slate-200">{bowlerStats?.maidens || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Dots</span>
                <span className="font-bold text-slate-200">{bowlerStats?.dotBalls || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Econ</span>
                <span className="font-bold text-slate-200">
                  {calcEcon(bowlerStats?.runsConceded || 0, bowlerStats?.ballsBowled || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
