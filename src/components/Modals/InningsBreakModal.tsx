"use client";

import React, { useState } from "react";
import { Match, Team } from "@/types/cricket";
import { Trophy, Target, Play, Flame } from "lucide-react";
import { sounds } from "@/utils/audio";

interface InningsBreakModalProps {
  isOpen: boolean;
  match: Match;
  onStartSecondInnings: (strikerId: string, nonStrikerId: string, openingBowlerId: string) => void;
}

export default function InningsBreakModal({
  isOpen,
  match,
  onStartSecondInnings,
}: InningsBreakModalProps) {
  if (!isOpen) return null;

  const inn1 = match.innings[0];
  const inn2 = match.innings[1];

  const team1: Team =
    match.teams.teamA.id === inn1.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const team2: Team =
    match.teams.teamA.id === inn2.battingTeamId ? match.teams.teamA : match.teams.teamB;

  const target = inn1.runs + 1;
  const totalBalls = match.settings.maxOvers * match.settings.ballsPerOver;
  const reqRunRate = ((target / totalBalls) * match.settings.ballsPerOver).toFixed(2);

  const [strikerId, setStrikerId] = useState<string>(team2.players[0]?.id || "");
  const [nonStrikerId, setNonStrikerId] = useState<string>(team2.players[1]?.id || "");
  const [openingBowlerId, setOpeningBowlerId] = useState<string>(team1.players[team1.players.length - 1]?.id || team1.players[0]?.id || "");

  const handleStart = () => {
    sounds.vibrate(50);
    sounds.playVictory();
    onStartSecondInnings(strikerId, nonStrikerId, openingBowlerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1624] border border-amber-500/40 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1 border-b border-slate-800 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 mb-1">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl font-black text-white">Innings Break!</h2>
          <p className="text-xs text-slate-400">
            {team1.name} completed their innings. Setting up the chase!
          </p>
        </div>

        {/* 1st Innings Score & Target Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{team1.logoEmoji}</span>
              <span className="text-sm font-bold text-slate-200">{team1.name}</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-black text-white">
                {inn1.runs}/{inn1.wickets}
              </span>
              <span className="text-xs text-slate-400 block">
                ({Math.floor(inn1.balls / match.settings.ballsPerOver)}.{inn1.balls % match.settings.ballsPerOver} overs)
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                  Target for {team2.shortName}
                </span>
                <span className="text-2xl font-black text-amber-300 font-mono">{target} runs</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
                Required Rate
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{reqRunRate} rpo</span>
            </div>
          </div>
        </div>

        {/* Setup 2nd Innings Openers */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300">
            Configure {team2.name} Opening Pair & Bowler:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Striker (Batter 1):</label>
              <select
                value={strikerId}
                onChange={(e) => setStrikerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {team2.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCaptain ? "(c)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Non-Striker (Batter 2):</label>
              <select
                value={nonStrikerId}
                onChange={(e) => setNonStrikerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {team2.players
                  .filter((p) => p.id !== strikerId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isWicketKeeper ? "(wk)" : ""}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Opening Bowler ({team1.name}):
            </label>
            <select
              value={openingBowlerId}
              onChange={(e) => setOpeningBowlerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {team1.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isCaptain ? "(c)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start 2nd Innings Chase button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 tap-btn mt-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start 2nd Innings Chase ({team2.shortName} need {target})</span>
        </button>
      </div>
    </div>
  );
}
