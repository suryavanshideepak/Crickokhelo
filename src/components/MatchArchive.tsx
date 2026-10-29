"use client";

import React from "react";
import { Match } from "@/types/cricket";
import { loadArchive, deleteArchivedMatch } from "@/utils/storage";
import { X, FolderOpen, Play, Trash2, Sparkles, Trophy } from "lucide-react";
import { sounds } from "@/utils/audio";

interface MatchArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (match: Match) => void;
  onLoadDemo: () => void;
}

export default function MatchArchive({
  isOpen,
  onClose,
  onSelectMatch,
  onLoadDemo,
}: MatchArchiveProps) {
  if (!isOpen) return null;

  const matches = loadArchive();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this match from your local saved matches?")) {
      deleteArchivedMatch(id);
      sounds.vibrate(30);
      // force reload archive state by calling onClose or user re-click
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1624] border border-sky-500/30 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saved Matches Archive</h2>
              <p className="text-xs text-slate-400">Locally stored matches on your browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Load Thriller Demo Preset Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              T20 Championship Thriller Demo
            </span>
            <p className="text-[11px] text-slate-300 truncate">
              IND 188/5 vs AUS 172/4 (18.2 ov). 17 runs needed in 10 balls!
            </p>
          </div>
          <button
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 tap-btn shadow-md shadow-amber-500/20"
          >
            Load Demo
          </button>
        </div>

        {/* Matches List */}
        <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No saved matches yet. Start a match or explore the demo!
            </div>
          ) : (
            matches.map((m) => {
              const inn1 = m.innings[0];
              const inn2 = m.innings[1];
              const teamA = m.teams.teamA;
              const teamB = m.teams.teamB;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    sounds.vibrate(30);
                    onSelectMatch(m);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition tap-btn flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[240px]">
                      {m.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      {teamA.logoEmoji} {teamA.shortName}: {inn1.runs}/{inn1.wickets}
                    </span>
                    <span className="text-slate-300">
                      {teamB.logoEmoji} {teamB.shortName}: {inn2.runs}/{inn2.wickets}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-emerald-400 font-medium truncate max-w-[280px]">
                      {m.result ? m.result.summary : m.status === "innings_break" ? "Innings Break" : "In Progress"}
                    </span>

                    <button
                      onClick={(e) => handleDelete(m.id, e)}
                      title="Delete saved match"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold tap-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
