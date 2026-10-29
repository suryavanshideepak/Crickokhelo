"use client";

import React, { useState } from "react";
import { Match, Innings, Team } from "@/types/cricket";
import { X, UserCheck, AlertTriangle, Check } from "lucide-react";
import { sounds } from "@/utils/audio";

interface BowlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onSelectBowler: (bowlerId: string) => void;
  isMandatoryOverChange?: boolean;
}

export default function BowlerModal({
  isOpen,
  onClose,
  match,
  onSelectBowler,
  isMandatoryOverChange,
}: BowlerModalProps) {
  if (!isOpen) return null;

  const inn: Innings = match.innings[match.currentInningsIndex];
  const bowlingTeam: Team =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  const [selectedId, setSelectedId] = useState<string>(
    bowlingTeam.players.find((p) => p.id !== inn.previousBowlerId && p.id !== inn.currentBowlerId)?.id ||
      bowlingTeam.players[0]?.id ||
      ""
  );

  const maxOversAllowed = match.settings.maxOversPerBowler;

  const handleSelect = () => {
    sounds.vibrate(40);
    onSelectBowler(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d1624] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Select Next Bowler</h2>
              <p className="text-xs text-slate-400">
                {isMandatoryOverChange ? "Over completed. Choose a new bowler." : "Change active bowler"}
              </p>
            </div>
          </div>
          {!isMandatoryOverChange && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {bowlingTeam.players.map((p) => {
            const stats = inn.bowlerStats[p.id] || {
              overs: 0,
              ballsBowled: 0,
              maidens: 0,
              runsConceded: 0,
              wickets: 0,
            };

            const isPrevBowler = p.id === inn.previousBowlerId;
            const isCurrentlyBowling = p.id === inn.currentBowlerId && !isMandatoryOverChange;
            const hasExhaustedOvers =
              maxOversAllowed > 0 && Math.floor(stats.ballsBowled / match.settings.ballsPerOver) >= maxOversAllowed;

            const isSelected = selectedId === p.id;

            return (
              <button
                key={p.id}
                type="button"
                disabled={hasExhaustedOvers || (isMandatoryOverChange && isPrevBowler)}
                onClick={() => setSelectedId(p.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition tap-btn ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400 shadow-sm"
                    : "bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/70"
                } ${hasExhaustedOvers || (isMandatoryOverChange && isPrevBowler) ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">{p.name}</span>
                    {p.isCaptain && (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                        (c)
                      </span>
                    )}
                    {p.isWicketKeeper && (
                      <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-1 rounded">
                        (wk)
                      </span>
                    )}
                    {isPrevBowler && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/20">
                        Bowled last ov
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {stats.overs} ov &bull; {stats.maidens} m &bull; {stats.runsConceded} r &bull;{" "}
                    <strong className="text-emerald-400">{stats.wickets} w</strong>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning if previous bowler selected */}
        {selectedId === inn.previousBowlerId && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Note: In standard cricket, the same bowler cannot bowl consecutive overs.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          {!isMandatoryOverChange && (
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold tap-btn"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSelect}
            className={`py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 tap-btn ${
              isMandatoryOverChange ? "w-full" : "w-2/3"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Confirm Bowler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
