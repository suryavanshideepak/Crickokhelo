"use client";

import React, { useState } from "react";
import { Match, BallRecord, Innings } from "@/types/cricket";
import { MessageSquare, Search, Filter } from "lucide-react";

interface CommentaryTabProps {
  match: Match;
}

export default function CommentaryTab({ match }: CommentaryTabProps) {
  const [selectedInningsIndex, setSelectedInningsIndex] = useState<0 | 1>(
    match.currentInningsIndex
  );
  const [filterQuery, setFilterQuery] = useState("");
  const [onlyBoundariesOrWickets, setOnlyBoundariesOrWickets] = useState(false);

  const inn: Innings = match.innings[selectedInningsIndex];
  const battingTeam =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const bowlingTeam =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  // Reverse list so newest balls are shown first
  const ballsDescending = [...inn.ballHistory].reverse();

  const filteredBalls = ballsDescending.filter((b) => {
    if (onlyBoundariesOrWickets) {
      if (b.runsOffBat !== 4 && b.runsOffBat !== 6 && !b.isWicket) return false;
    }
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const striker = battingTeam.players.find((p) => p.id === b.strikerId)?.name.toLowerCase() || "";
    const bowler = bowlingTeam.players.find((p) => p.id === b.bowlerId)?.name.toLowerCase() || "";
    return b.commentary.toLowerCase().includes(q) || striker.includes(q) || bowler.includes(q);
  });

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

  return (
    <div className="w-full flex flex-col gap-4 text-white animate-in fade-in duration-150">
      {/* Innings Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSelectedInningsIndex(0)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition tap-btn ${
            selectedInningsIndex === 0
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <span>1st Innings ({match.innings[0].runs}/{match.innings[0].wickets})</span>
        </button>

        <button
          onClick={() => setSelectedInningsIndex(1)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition tap-btn ${
            selectedInningsIndex === 1
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <span>2nd Innings ({match.innings[1].runs}/{match.innings[1].wickets})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search bowler, batsman, or key phrase..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => setOnlyBoundariesOrWickets(!onlyBoundariesOrWickets)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition tap-btn ${
            onlyBoundariesOrWickets
              ? "bg-amber-500 text-slate-950 font-bold"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Boundaries & Wickets</span>
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="flex flex-col gap-3">
        {filteredBalls.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No deliveries match your filter.
          </div>
        ) : (
          filteredBalls.map((b) => {
            const striker = battingTeam.players.find((p) => p.id === b.strikerId);
            const bowler = bowlingTeam.players.find((p) => p.id === b.bowlerId);
            const overDisplay = `${b.overNumber}.${b.ballInOver}`;

            return (
              <div
                key={b.id}
                className="glass-panel rounded-xl p-3 sm:p-4 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition"
              >
                {/* Ball badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-md ${getBallBadgeClass(
                    b
                  )}`}
                >
                  {getBallLabel(b)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="text-xs font-semibold text-slate-300">
                      <span className="font-mono text-emerald-400 font-bold mr-1.5">
                        {overDisplay}
                      </span>
                      <span>{bowler?.name || "Bowler"}</span> to{" "}
                      <span className="text-white font-bold">{striker?.name || "Batter"}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      {b.cumulativeScore}/{b.cumulativeWickets}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {b.commentary}
                  </p>

                  {b.shotZone && (
                    <div className="mt-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block uppercase font-bold tracking-wider">
                      🎯 {b.shotZone.replace("_", " ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
