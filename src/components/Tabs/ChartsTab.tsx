"use client";

import React, { useState } from "react";
import { Match, Innings, Team } from "@/types/cricket";
import { TrendingUp, BarChart3, Users } from "lucide-react";

interface ChartsTabProps {
  match: Match;
}

export default function ChartsTab({ match }: ChartsTabProps) {
  const [chartType, setChartType] = useState<"worm" | "manhattan" | "partnerships">("worm");
  const [selectedInningsIndex, setSelectedInningsIndex] = useState<0 | 1>(
    match.currentInningsIndex
  );

  const inn1 = match.innings[0];
  const inn2 = match.innings[1];
  const activeInn = match.innings[selectedInningsIndex];

  const team1: Team =
    match.teams.teamA.id === inn1.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const team2: Team =
    match.teams.teamA.id === inn2.battingTeamId ? match.teams.teamA : match.teams.teamB;

  const maxOvers = match.settings.maxOvers;

  // Build over-by-over progression data for Worm Chart
  const buildOverData = (inn: Innings) => {
    const data: { over: number; runs: number; wickets: number }[] = [{ over: 0, runs: 0, wickets: 0 }];
    for (let ov = 1; ov <= maxOvers; ov++) {
      const ballsUpToOver = inn.ballHistory.filter((b) => b.overNumber < ov);
      if (ballsUpToOver.length > 0) {
        const lastBall = ballsUpToOver[ballsUpToOver.length - 1];
        data.push({
          over: ov,
          runs: lastBall.cumulativeScore,
          wickets: lastBall.cumulativeWickets,
        });
      } else if (ov === 1 && inn.runs > 0) {
        data.push({ over: 1, runs: inn.runs, wickets: inn.wickets });
      }
    }
    return data;
  };

  const inn1Data = buildOverData(inn1);
  const inn2Data = buildOverData(inn2);

  const highestScore = Math.max(
    inn1.runs,
    inn2.runs,
    inn2.target || 0,
    150
  );

  // Build per-over runs for Manhattan Chart
  const buildManhattanData = (inn: Innings) => {
    const overRuns: { over: number; runs: number; wickets: number }[] = [];
    for (let ov = 0; ov < maxOvers; ov++) {
      const ballsInOver = inn.ballHistory.filter((b) => b.overNumber === ov);
      if (ballsInOver.length > 0) {
        const runs = ballsInOver.reduce((acc, b) => acc + b.totalRuns, 0);
        const wickets = ballsInOver.filter((b) => b.isWicket).length;
        overRuns.push({ over: ov + 1, runs, wickets });
      }
    }
    return overRuns;
  };

  const manhattanData = buildManhattanData(activeInn);
  const maxOverRun = Math.max(...manhattanData.map((d) => d.runs), 15);

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Coordinate mappers for Worm Chart
  const getX = (over: number) => padding.left + (over / maxOvers) * graphWidth;
  const getY = (runs: number) =>
    padding.top + graphHeight - (runs / highestScore) * graphHeight;

  // Generate SVG path for worm chart
  const generatePath = (data: { over: number; runs: number }[]) => {
    if (data.length === 0) return "";
    return data.reduce((acc, curr, idx) => {
      const x = getX(curr.over);
      const y = getY(curr.runs);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  };

  const inn1Path = generatePath(inn1Data);
  const inn2Path = generatePath(inn2Data);

  return (
    <div className="w-full flex flex-col gap-4 text-white animate-in fade-in duration-150">
      {/* Chart Selector Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setChartType("worm")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition tap-btn ${
            chartType === "worm"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Worm Chart (Comparison)</span>
        </button>

        <button
          onClick={() => setChartType("manhattan")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition tap-btn ${
            chartType === "manhattan"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Manhattan Chart</span>
        </button>

        <button
          onClick={() => setChartType("partnerships")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition tap-btn ${
            chartType === "partnerships"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Partnerships</span>
        </button>
      </div>

      {/* Innings selector for Manhattan & Partnerships */}
      {chartType !== "worm" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedInningsIndex(0)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold tap-btn ${
              selectedInningsIndex === 0
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1st Innings ({team1.shortName})
          </button>
          <button
            onClick={() => setSelectedInningsIndex(1)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold tap-btn ${
              selectedInningsIndex === 1
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            2nd Innings ({team2.shortName})
          </button>
        </div>
      )}

      {/* 1. WORM CHART */}
      {chartType === "worm" && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cumulative Run Progression Comparison
            </span>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
                {team1.shortName}: {inn1.runs}/{inn1.wickets}
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
                {team2.shortName}: {inn2.runs}/{inn2.wickets}
              </span>
            </div>
          </div>

          {/* SVG Graph Container */}
          <div className="w-full overflow-x-auto bg-slate-950/70 rounded-xl p-2 border border-slate-900">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + graphHeight * ratio;
                const scoreLabel = Math.round(highestScore * (1 - ratio));
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {scoreLabel}
                    </text>
                  </g>
                );
              })}

              {/* X Axis ticks */}
              {[0, 5, 10, 15, 20].filter((ov) => ov <= maxOvers).map((ov) => {
                const x = getX(ov);
                return (
                  <g key={ov}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + graphHeight}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={padding.top + graphHeight + 18}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {ov} ov
                    </text>
                  </g>
                );
              })}

              {/* Target Line if 2nd innings */}
              {inn2.target && (
                <line
                  x1={padding.left}
                  y1={getY(inn2.target)}
                  x2={padding.left + graphWidth}
                  y2={getY(inn2.target)}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeWidth="1.5"
                />
              )}

              {/* Innings 1 Line (Sky Blue) */}
              <path
                d={inn1Path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Innings 2 Line (Amber) */}
              <path
                d={inn2Path}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Wicket dots for Innings 1 */}
              {inn1Data
                .filter((d) => d.wickets > 0)
                .map((d, i) => (
                  <circle
                    key={`w1_${i}`}
                    cx={getX(d.over)}
                    cy={getY(d.runs)}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1"
                  />
                ))}

              {/* Wicket dots for Innings 2 */}
              {inn2Data
                .filter((d) => d.wickets > 0)
                .map((d, i) => (
                  <circle
                    key={`w2_${i}`}
                    cx={getX(d.over)}
                    cy={getY(d.runs)}
                    r="4"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
            </svg>
          </div>
        </div>
      )}

      {/* 2. MANHATTAN CHART */}
      {chartType === "manhattan" && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Runs Scored Per Over &bull; {team1.name}
          </span>

          <div className="w-full overflow-x-auto bg-slate-950/70 rounded-xl p-2 border border-slate-900">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[500px]"
            >
              {/* Horizontal grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio) => {
                const y = padding.top + graphHeight * (1 - ratio);
                const runVal = Math.round(maxOverRun * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {runVal}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {manhattanData.map((d) => {
                const barWidth = Math.max(12, graphWidth / (maxOvers * 1.5));
                const x = padding.left + ((d.over - 0.5) / maxOvers) * graphWidth - barWidth / 2;
                const barHeight = (d.runs / maxOverRun) * graphHeight;
                const y = padding.top + graphHeight - barHeight;

                return (
                  <g key={d.over}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      fill={selectedInningsIndex === 0 ? "#0284c7" : "#eab308"}
                      className="hover:brightness-125 transition"
                    />
                    {/* Runs label on top of bar */}
                    {d.runs > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        fill="#cbd5e1"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {d.runs}
                      </text>
                    )}

                    {/* Wickets red badge */}
                    {d.wickets > 0 && (
                      <circle
                        cx={x + barWidth / 2}
                        cy={y - 12}
                        r="3.5"
                        fill="#ef4444"
                      />
                    )}

                    {/* Over number label */}
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + graphHeight + 16}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {d.over}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 3. PARTNERSHIPS */}
      {chartType === "partnerships" && (
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Wicket Partnerships
          </span>

          <div className="flex flex-col gap-3">
            {activeInn.fallOfWickets.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                Opening partnership is currently underway ({activeInn.runs} runs unbroken).
              </div>
            ) : (
              activeInn.fallOfWickets.map((fow, idx) => {
                const prevScore = idx === 0 ? 0 : activeInn.fallOfWickets[idx - 1].score;
                const partnershipRuns = fow.score - prevScore;
                const pct = Math.min(100, (partnershipRuns / Math.max(1, activeInn.runs)) * 100);

                return (
                  <div
                    key={fow.wicketNumber}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        {fow.wicketNumber}
                        {fow.wicketNumber === 1
                          ? "st"
                          : fow.wicketNumber === 2
                          ? "nd"
                          : fow.wicketNumber === 3
                          ? "rd"
                          : "th"}{" "}
                        Wicket Partnership
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {partnershipRuns} runs
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-sky-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Wicket fell at {fow.score} ({fow.overs} ov)</span>
                      <span>Batsman out: {fow.playerRuns} ({fow.playerBalls})</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
