"use client";

import React from "react";
import { Match, Team } from "@/types/cricket";
import { Users, Shield, Award } from "lucide-react";

interface TeamsTabProps {
  match: Match;
}

export default function TeamsTab({ match }: TeamsTabProps) {
  const teamA = match.teams.teamA;
  const teamB = match.teams.teamB;

  const renderTeamSquad = (team: Team, isTeamA: boolean) => {
    return (
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{team.logoEmoji}</span>
            <div>
              <h3 className="text-base font-bold text-white">{team.name}</h3>
              <span className="text-xs text-slate-400 font-mono">
                {team.shortName} &bull; {team.players.length} Players
              </span>
            </div>
          </div>
          <div
            className="w-4 h-4 rounded-full border border-white/20"
            style={{ backgroundColor: team.color }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {team.players.map((p, idx) => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-200 truncate">{p.name}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {p.isCaptain && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    C
                  </span>
                )}
                {p.isWicketKeeper && (
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    WK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 text-white animate-in fade-in duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderTeamSquad(teamA, true)}
        {renderTeamSquad(teamB, false)}
      </div>

      {/* Match Umpires & Ground Information Card */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div>
          <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
            Match Venue
          </span>
          <span className="font-semibold text-white">{match.settings.venue}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
            Match Date
          </span>
          <span className="font-semibold text-white">{match.settings.matchDate}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
            Match Format
          </span>
          <span className="font-semibold text-white uppercase">{match.settings.matchType} ({match.settings.maxOvers} Overs)</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-bold text-[10px] tracking-wider">
            Toss
          </span>
          <span className="font-semibold text-white">
            {match.toss.winnerTeamId === match.teams.teamA.id ? match.teams.teamA.name : match.teams.teamB.name} won and elected to {match.toss.decision}
          </span>
        </div>
      </div>
    </div>
  );
}
