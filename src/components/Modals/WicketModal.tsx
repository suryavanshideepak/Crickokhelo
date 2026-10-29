"use client";

import React, { useState } from "react";
import { Match, Innings, DismissalType, Player } from "@/types/cricket";
import { X, ShieldAlert, Check } from "lucide-react";
import { sounds } from "@/utils/audio";

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onConfirmWicket: (details: {
    dismissalType: DismissalType;
    outPlayerId: string;
    fielderId?: string;
    runsCompleted: number;
    newBatsmanId?: string;
  }) => void;
}

const dismissalTypes: { type: DismissalType; label: string; bowlerCredited: boolean }[] = [
  { type: "caught", label: "Caught (c & b / c fielder)", bowlerCredited: true },
  { type: "bowled", label: "Bowled (Clean bowled)", bowlerCredited: true },
  { type: "lbw", label: "L.B.W. (Leg Before Wicket)", bowlerCredited: true },
  { type: "run_out", label: "Run Out", bowlerCredited: false },
  { type: "stumped", label: "Stumped", bowlerCredited: true },
  { type: "hit_wicket", label: "Hit Wicket", bowlerCredited: true },
  { type: "retired_hurt", label: "Retired Hurt", bowlerCredited: false },
];

export default function WicketModal({
  isOpen,
  onClose,
  match,
  onConfirmWicket,
}: WicketModalProps) {
  if (!isOpen) return null;

  const inn: Innings = match.innings[match.currentInningsIndex];
  const battingTeam =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const bowlingTeam =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  const striker = battingTeam.players.find((p) => p.id === inn.strikerId);
  const nonStriker = battingTeam.players.find((p) => p.id === inn.nonStrikerId);

  const [dismissalType, setDismissalType] = useState<DismissalType>("caught");
  const [outPlayerId, setOutPlayerId] = useState<string>(inn.strikerId);
  const [fielderId, setFielderId] = useState<string>("");
  const [runsCompleted, setRunsCompleted] = useState<number>(0);

  // Available batsmen to come in next
  const availableBatsmen = battingTeam.players.filter(
    (p) =>
      inn.dnbPlayerIds.includes(p.id) ||
      (p.id !== inn.strikerId && p.id !== inn.nonStrikerId && !inn.batterStats[p.id]?.isOut)
  );

  const [newBatsmanId, setNewBatsmanId] = useState<string>(
    availableBatsmen[0]?.id || ""
  );

  const handleConfirm = () => {
    sounds.vibrate([80, 50, 80]);
    sounds.playWicket();

    onConfirmWicket({
      dismissalType,
      outPlayerId,
      fielderId: fielderId || undefined,
      runsCompleted,
      newBatsmanId: newBatsmanId || undefined,
    });
    onClose();
  };

  const needsFielder = dismissalType === "caught" || dismissalType === "run_out" || dismissalType === "stumped";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1624] border border-red-500/40 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Wicket Fall / Dismissal</h2>
              <p className="text-xs text-slate-400">Record batsman dismissal details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Who is Out? */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Dismissed Batsman:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOutPlayerId(striker?.id || "")}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition tap-btn ${
                outPlayerId === striker?.id
                  ? "bg-red-500/20 border-red-500 text-white shadow-sm"
                  : "bg-slate-800/80 border-slate-700 text-slate-300"
              }`}
            >
              <span className="text-xs font-bold truncate">
                {striker?.name} <span className="text-emerald-400">*</span>
              </span>
              <span className="text-[11px] text-slate-400">Striker</span>
            </button>

            <button
              type="button"
              onClick={() => setOutPlayerId(nonStriker?.id || "")}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition tap-btn ${
                outPlayerId === nonStriker?.id
                  ? "bg-red-500/20 border-red-500 text-white shadow-sm"
                  : "bg-slate-800/80 border-slate-700 text-slate-300"
              }`}
            >
              <span className="text-xs font-bold truncate">{nonStriker?.name}</span>
              <span className="text-[11px] text-slate-400">Non-Striker (Run Out)</span>
            </button>
          </div>
        </div>

        {/* 2. Dismissal Type Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            2. Dismissal Method:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dismissalTypes.map((dt) => (
              <button
                key={dt.type}
                type="button"
                onClick={() => setDismissalType(dt.type)}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition tap-btn truncate ${
                  dismissalType === dt.type
                    ? "bg-red-600 text-white border-red-400 font-bold shadow-md shadow-red-600/30"
                    : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700/80"
                }`}
              >
                {dt.label.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Fielder Selector if caught/run out/stumped */}
        {needsFielder && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. Fielder / Wicketkeeper Involved:
            </label>
            <select
              value={fielderId}
              onChange={(e) => setFielderId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select Fielder (or bowler if c&b)</option>
              {bowlingTeam.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isWicketKeeper ? "(wk)" : ""} {p.isCaptain ? "(c)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Runs completed if Run Out */}
        {dismissalType === "run_out" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Runs completed before run out:
            </label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRunsCompleted(r)}
                  className={`w-10 h-10 rounded-lg border font-bold text-xs tap-btn ${
                    runsCompleted === r
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Next Batsman */}
        {availableBatsmen.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              4. Next Batsman:
            </label>
            <select
              value={newBatsmanId}
              onChange={(e) => setNewBatsmanId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {availableBatsmen.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isCaptain ? "(c)" : ""} {p.isWicketKeeper ? "(wk)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            ⚠️ No more remaining batsmen. Batting side will be all out after this wicket.
          </div>
        )}

        {/* Confirm Button */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold tap-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 tap-btn"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Dismissal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
