"use client";

import React, { useState } from "react";
import { Match, BallRecord, ShotZone, Team } from "@/types/cricket";
import { Compass, Filter } from "lucide-react";

interface WagonWheelTabProps {
  match: Match;
}

const zoneAngleMap: Record<ShotZone, number> = {
  straight: 270, // 12 o'clock (down ground)
  long_off: 305,
  cover: 345,
  point: 25,
  third_man: 70,
  fine_leg: 110,
  square_leg: 155,
  mid_wicket: 195,
  long_on: 235,
};

export default function WagonWheelTab({ match }: WagonWheelTabProps) {
  const [selectedInningsIndex, setSelectedInningsIndex] = useState<0 | 1>(
    match.currentInningsIndex
  );
  const [selectedBatterId, setSelectedBatterId] = useState<string>("all");

  const inn = match.innings[selectedInningsIndex];
  const battingTeam: Team =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;

  // Filter balls with shot coordinates or shot zones
  const shots = inn.ballHistory.filter((b) => {
    if (b.runsOffBat === 0 && !b.shotZone) return false;
    if (selectedBatterId !== "all" && b.strikerId !== selectedBatterId) return false;
    return true;
  });

  // Calculate sector breakdowns: Off-side (left in standard diagram) vs Leg-side
  let offSideRuns = 0;
  let legSideRuns = 0;
  shots.forEach((s) => {
    if (s.shotZone) {
      if (["cover", "point", "third_man", "long_off"].includes(s.shotZone)) {
        offSideRuns += s.runsOffBat;
      } else {
        legSideRuns += s.runsOffBat;
      }
    }
  });

  const totalScoredRuns = offSideRuns + legSideRuns || 1;
  const offSidePct = Math.round((offSideRuns / totalScoredRuns) * 100);
  const legSidePct = 100 - offSidePct;

  // Center of cricket ground
  const cx = 175;
  const cy = 175;
  const boundaryRadius = 150;
  const innerCircleRadius = 85;

  return (
    <div className="w-full flex flex-col gap-4 text-white animate-in fade-in duration-150">
      {/* Innings & Batsman Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedInningsIndex(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition tap-btn ${
              selectedInningsIndex === 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            1st Innings ({match.innings[0].runs}/{match.innings[0].wickets})
          </button>
          <button
            onClick={() => setSelectedInningsIndex(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition tap-btn ${
              selectedInningsIndex === 1
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            2nd Innings ({match.innings[1].runs}/{match.innings[1].wickets})
          </button>
        </div>

        {/* Batter Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedBatterId}
            onChange={(e) => setSelectedBatterId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Batsmen ({battingTeam.shortName})</option>
            {battingTeam.players.map((p) => {
              const bStat = inn.batterStats[p.id];
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({bStat?.runs || 0} runs)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: 2D Wagon Wheel Visual */}
        <div className="md:col-span-8 glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[370px] aspect-square flex items-center justify-center">
            <svg
              viewBox="0 0 350 350"
              className="w-full h-full drop-shadow-2xl"
            >
              {/* Cricket Turf Background Oval */}
              <circle
                cx={cx}
                cy={cy}
                r={boundaryRadius}
                fill="#062e1e"
                stroke="#10b981"
                strokeWidth="2.5"
                className="opacity-90"
              />

              {/* 30 Yard Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={innerCircleRadius}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                className="opacity-50"
              />

              {/* Pitch in the middle */}
              <rect
                x={cx - 7}
                y={cy - 22}
                width="14"
                height="44"
                rx="2"
                fill="#d97706"
                className="opacity-60"
              />
              <line
                x1={cx - 5}
                y1={cy - 16}
                x2={cx + 5}
                y2={cy - 16}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <line
                x1={cx - 5}
                y1={cy + 16}
                x2={cx + 5}
                y2={cy + 16}
                stroke="#ffffff"
                strokeWidth="1"
              />

              {/* Shot Direction Ray Lines */}
              {shots.map((s, idx) => {
                let angle = 0;
                if (s.shotCoordinates) {
                  // If explicit coordinates
                  angle =
                    (Math.atan2(s.shotCoordinates.y - 50, s.shotCoordinates.x - 50) * 180) / Math.PI;
                } else if (s.shotZone) {
                  // Map zone angle with slight jitter for realism
                  const baseAngle = zoneAngleMap[s.shotZone] || 0;
                  const jitter = (idx % 5 - 2) * 4;
                  angle = baseAngle + jitter;
                } else {
                  // Fallback radial spread based on index
                  angle = (idx * 47) % 360;
                }

                const rad = (angle * Math.PI) / 180;

                // Length depends on runs: 6 goes outside boundary, 4 hits boundary rope, 1/2 inside
                let distance = innerCircleRadius * 0.7;
                let strokeColor = "#34d399"; // green
                let strokeWidth = 1.2;

                if (s.runsOffBat === 6) {
                  distance = boundaryRadius * 1.05;
                  strokeColor = "#c084fc"; // purple glow
                  strokeWidth = 2.4;
                } else if (s.runsOffBat === 4) {
                  distance = boundaryRadius * 0.98;
                  strokeColor = "#38bdf8"; // bright blue
                  strokeWidth = 2;
                } else if (s.runsOffBat >= 2) {
                  distance = boundaryRadius * 0.75;
                  strokeColor = "#fbbf24"; // amber
                  strokeWidth = 1.5;
                }

                const x2 = cx + distance * Math.cos(rad);
                const y2 = cy + distance * Math.sin(rad);

                return (
                  <g key={s.id || idx}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    <circle
                      cx={x2}
                      cy={y2}
                      r={s.runsOffBat >= 4 ? "3" : "2"}
                      fill={strokeColor}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold mt-4">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              Sixes (6)
            </span>
            <span className="flex items-center gap-1.5 text-sky-300">
              <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
              Fours (4)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              Twos / Threes
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Singles (1)
            </span>
          </div>
        </div>

        {/* Right: Sector Analytics */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Side-by-Side Scoring Breakdown
            </span>

            {/* Off-side vs Leg-side Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-sky-400">Off Side ({offSidePct}%)</span>
                <span className="text-emerald-400">Leg Side ({legSidePct}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-sky-500 h-full transition-all duration-300"
                  style={{ width: `${offSidePct}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${legSidePct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Off-side Runs</span>
                <span className="text-lg font-bold text-sky-400 font-mono">{offSideRuns}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Leg-side Runs</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{legSideRuns}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-200">Tip for Scorers:</strong> Use the{" "}
            <span className="text-emerald-400 font-semibold">Shot Zone</span> button on the scoring
            console while registering deliveries to log precise field directions for this wagon wheel!
          </div>
        </div>
      </div>
    </div>
  );
}
