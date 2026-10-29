"use client";

import React, { useState } from "react";
import { Match, Innings, Team } from "@/types/cricket";

interface ScorecardTabProps {
  match: Match;
}

export default function ScorecardTab({ match }: ScorecardTabProps) {
  const [selectedInningsIndex, setSelectedInningsIndex] = useState<0 | 1>(
    match.currentInningsIndex
  );

  const inn: Innings = match.innings[selectedInningsIndex];
  const battingTeam: Team =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const bowlingTeam: Team =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  const oversCompleted = Math.floor(inn.balls / match.settings.ballsPerOver);
  const ballsInOver = inn.balls % match.settings.ballsPerOver;
  const totalOversDec = oversCompleted + ballsInOver / match.settings.ballsPerOver;
  const crr = totalOversDec > 0 ? (inn.runs / totalOversDec).toFixed(2) : "0.00";

  // Batters who batted
  const battedPlayers = battingTeam.players.filter(
    (p) =>
      inn.batterStats[p.id]?.balls > 0 ||
      inn.batterStats[p.id]?.isOut ||
      p.id === inn.strikerId ||
      p.id === inn.nonStrikerId
  );

  // Did not bat players
  const dnbPlayers = battingTeam.players.filter(
    (p) => !battedPlayers.some((bp) => bp.id === p.id)
  );

  // Bowlers who bowled
  const bowledPlayers = bowlingTeam.players.filter(
    (p) =>
      inn.bowlerStats[p.id]?.ballsBowled > 0 ||
      p.id === inn.currentBowlerId ||
      p.id === inn.previousBowlerId
  );

  return (
    <div className="w-full flex flex-col gap-5 text-white animate-in fade-in duration-150">
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
          <span>{match.innings[0].battingTeamId === match.teams.teamA.id ? match.teams.teamA.logoEmoji : match.teams.teamB.logoEmoji}</span>
          <span>1st Innings: {match.innings[0].runs}/{match.innings[0].wickets}</span>
        </button>

        <button
          onClick={() => setSelectedInningsIndex(1)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition tap-btn ${
            selectedInningsIndex === 1
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <span>{match.innings[1].battingTeamId === match.teams.teamA.id ? match.teams.teamA.logoEmoji : match.teams.teamB.logoEmoji}</span>
          <span>2nd Innings: {match.innings[1].runs}/{match.innings[1].wickets}</span>
        </button>
      </div>

      {/* Innings Heading */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">{battingTeam.logoEmoji}</span>
          <span className="text-base sm:text-lg font-bold text-white">
            {battingTeam.name} Innings
          </span>
        </div>
        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-xl font-black text-white">
            {inn.runs}/{inn.wickets}
          </span>
          <span className="text-xs text-slate-400">
            ({oversCompleted}.{ballsInOver} ov, RR: {crr})
          </span>
        </div>
      </div>

      {/* BATTING TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Batting
          </span>
          <span className="text-xs text-slate-400 font-mono">R (B) &bull; 4s / 6s &bull; SR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/40">
                <th className="py-2.5 px-4 font-normal">Batter</th>
                <th className="py-2.5 px-2 font-normal hidden sm:table-cell">Dismissal</th>
                <th className="py-2.5 px-3 text-right font-semibold text-slate-200">R</th>
                <th className="py-2.5 px-3 text-right font-normal">B</th>
                <th className="py-2.5 px-2 text-right font-normal">4s</th>
                <th className="py-2.5 px-2 text-right font-normal">6s</th>
                <th className="py-2.5 px-4 text-right font-normal">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {battedPlayers.map((p) => {
                const stats = inn.batterStats[p.id] || {
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  isOut: false,
                };
                const isStriker = p.id === inn.strikerId && !stats.isOut;
                const isNonStriker = p.id === inn.nonStrikerId && !stats.isOut;
                const sr =
                  stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : "0.0";

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isStriker ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isCaptain && (
                          <span className="text-[10px] text-amber-400 font-bold">(c)</span>
                        )}
                        {p.isWicketKeeper && (
                          <span className="text-[10px] text-sky-400 font-bold">(wk)</span>
                        )}
                        {isStriker && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                            *
                          </span>
                        )}
                        {isNonStriker && (
                          <span className="text-[10px] text-slate-400">#</span>
                        )}
                      </div>
                      <div className="sm:hidden text-[11px] text-slate-400 mt-0.5 font-normal">
                        {stats.isOut
                          ? stats.dismissal?.text || "out"
                          : "not out"}
                      </div>
                    </td>

                    <td className="py-3 px-2 text-xs text-slate-400 hidden sm:table-cell font-mono">
                      {stats.isOut
                        ? stats.dismissal?.text || "out"
                        : "not out"}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white font-mono">
                      {stats.runs}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 font-mono">
                      {stats.balls}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300 font-mono">
                      {stats.fours}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300 font-mono">
                      {stats.sixes}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 font-mono">
                      {sr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Extras & Total Row */}
        <div className="bg-slate-950/60 p-4 border-t border-slate-800 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold">Extras:</span>
            <span className="font-mono">
              <strong className="text-white">{inn.extras.total}</strong> (b {inn.extras.byes}, lb{" "}
              {inn.extras.legByes}, w {inn.extras.wides}, nb {inn.extras.noBalls}, pen{" "}
              {inn.extras.penalties})
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-100 font-bold text-sm pt-2 border-t border-slate-800">
            <span>Total Score:</span>
            <span className="font-mono text-base">
              {inn.runs}/{inn.wickets}{" "}
              <span className="text-xs text-slate-400 font-normal">
                ({oversCompleted}.{ballsInOver} Overs, RR: {crr})
              </span>
            </span>
          </div>

          {dnbPlayers.length > 0 && (
            <div className="pt-2 text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Yet to Bat: </span>
              {dnbPlayers.map((p, i) => (
                <span key={p.id}>
                  {p.name}
                  {i < dnbPlayers.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FALL OF WICKETS */}
      {inn.fallOfWickets.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5">
            Fall of Wickets
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {inn.fallOfWickets.map((fow) => {
              const player = battingTeam.players.find((p) => p.id === fow.playerId);
              return (
                <div
                  key={fow.wicketNumber}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300"
                >
                  <strong className="text-red-400">
                    {fow.wicketNumber}-{fow.score}
                  </strong>{" "}
                  <span className="text-slate-200">({player?.name || "Player"},</span>{" "}
                  <span className="text-slate-400">{fow.overs} ov)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOWLING TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Bowling
          </span>
          <span className="text-xs text-slate-400 font-mono">O - M - R - W &bull; Econ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/40">
                <th className="py-2.5 px-4 font-normal">Bowler</th>
                <th className="py-2.5 px-3 text-right font-normal">O</th>
                <th className="py-2.5 px-3 text-right font-normal">M</th>
                <th className="py-2.5 px-3 text-right font-normal">R</th>
                <th className="py-2.5 px-3 text-right font-semibold text-emerald-400">W</th>
                <th className="py-2.5 px-3 text-right font-normal">Econ</th>
                <th className="py-2.5 px-3 text-right font-normal">Dots</th>
                <th className="py-2.5 px-4 text-right font-normal">Wd / Nb</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {bowledPlayers.map((p) => {
                const stats = inn.bowlerStats[p.id] || {
                  overs: 0,
                  ballsBowled: 0,
                  maidens: 0,
                  runsConceded: 0,
                  wickets: 0,
                  wides: 0,
                  noBalls: 0,
                  dotBalls: 0,
                };
                const isCurrent = p.id === inn.currentBowlerId;
                const econ =
                  stats.ballsBowled > 0
                    ? ((stats.runsConceded / stats.ballsBowled) * match.settings.ballsPerOver).toFixed(2)
                    : "0.00";

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isCurrent ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-white font-sans">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                            * Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">{stats.overs}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{stats.maidens}</td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">{stats.runsConceded}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-extrabold">{stats.wickets}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{econ}</td>
                    <td className="py-3 px-3 text-right text-slate-400">{stats.dotBalls}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {stats.wides} / {stats.noBalls}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
