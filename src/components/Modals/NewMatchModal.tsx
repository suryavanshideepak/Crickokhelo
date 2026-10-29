"use client";

import React, { useState } from "react";
import { Match, MatchSettings, MatchType, Player, Team } from "@/types/cricket";
import { createInitialInnings } from "@/utils/demoMatch";
import { X, ArrowRight, ArrowLeft, Trophy, Users, Award, Check } from "lucide-react";
import { sounds } from "@/utils/audio";

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (newMatch: Match) => void;
}

const formatPresets: {
  id: MatchType;
  label: string;
  overs: number;
  maxBowlerOvers: number;
  ballsPerOver: number;
}[] = [
  { id: "t20", label: "T20 Match", overs: 20, maxBowlerOvers: 4, ballsPerOver: 6 },
  { id: "10_over", label: "10-Over Slam", overs: 10, maxBowlerOvers: 2, ballsPerOver: 6 },
  { id: "5_over", label: "5-Over Blitz", overs: 5, maxBowlerOvers: 1, ballsPerOver: 6 },
  { id: "odi", label: "ODI (50 Over)", overs: 50, maxBowlerOvers: 10, ballsPerOver: 6 },
  { id: "custom", label: "Box / Gully Cricket", overs: 8, maxBowlerOvers: 2, ballsPerOver: 6 },
];

export default function NewMatchModal({
  isOpen,
  onClose,
  onCreateMatch,
}: NewMatchModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Settings
  const [title, setTitle] = useState("Local Turf Cricket League");
  const [venue, setVenue] = useState("National Cricket Ground");
  const [format, setFormat] = useState<MatchType>("t20");
  const [maxOvers, setMaxOvers] = useState<number>(20);
  const [maxOversPerBowler, setMaxOversPerBowler] = useState<number>(4);
  const [ballsPerOver, setBallsPerOver] = useState<number>(6);

  // Team A
  const [teamAName, setTeamAName] = useState("Mumbai Strikers");
  const [teamAShort, setTeamAShort] = useState("MUM");
  const [teamAEmoji, setTeamAEmoji] = useState("🦁");
  const [teamAPlayersText, setTeamAPlayersText] = useState(
    "Rohit Sharma, Ishan Kishan, Suryakumar Yadav, Tilak Varma, Hardik Pandya, Tim David, Krunal Pandya, Jasprit Bumrah, Piyush Chawla, Gerald Coetzee, Nuwan Thushara"
  );

  // Team B
  const [teamBName, setTeamBName] = useState("Chennai Kings");
  const [teamBShort, setTeamBShort] = useState("CSK");
  const [teamBEmoji, setTeamBEmoji] = useState("👑");
  const [teamBPlayersText, setTeamBPlayersText] = useState(
    "Ruturaj Gaikwad, Rachin Ravindra, Ajinkya Rahane, Shivam Dube, Daryl Mitchell, MS Dhoni, Ravindra Jadeja, Deepak Chahar, Shardul Thakur, Tushar Deshpande, Matheesha Pathirana"
  );

  // Step 3: Toss & Openers
  const [tossWinner, setTossWinner] = useState<"teamA" | "teamB">("teamA");
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");

  const handleSelectFormat = (preset: (typeof formatPresets)[0]) => {
    setFormat(preset.id);
    setMaxOvers(preset.overs);
    setMaxOversPerBowler(preset.maxBowlerOvers);
    setBallsPerOver(preset.ballsPerOver);
  };

  const handleCreate = () => {
    // Parse players
    const parsePlayers = (text: string, prefix: string): Player[] => {
      const names = text
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      return names.map((name, idx) => ({
        id: `${prefix}_${idx + 1}`,
        name,
        isCaptain: idx === 0,
        isWicketKeeper: idx === 3 || idx === 5,
        avatarColor: prefix === "teamA" ? "#0284c7" : "#eab308",
      }));
    };

    const teamAPlayers = parsePlayers(teamAPlayersText, "teamA");
    const teamBPlayers = parsePlayers(teamBPlayersText, "teamB");

    const teamA: Team = {
      id: "team_a",
      name: teamAName,
      shortName: teamAShort,
      color: "#0284c7",
      logoEmoji: teamAEmoji,
      players: teamAPlayers,
    };

    const teamB: Team = {
      id: "team_b",
      name: teamBName,
      shortName: teamBShort,
      color: "#eab308",
      logoEmoji: teamBEmoji,
      players: teamBPlayers,
    };

    const tossWinnerId = tossWinner === "teamA" ? teamA.id : teamB.id;
    const battingFirstTeam =
      tossDecision === "bat"
        ? tossWinnerId === teamA.id
          ? teamA
          : teamB
        : tossWinnerId === teamA.id
        ? teamB
        : teamA;

    const bowlingFirstTeam = battingFirstTeam.id === teamA.id ? teamB : teamA;

    const settings: MatchSettings = {
      maxOvers,
      ballsPerOver,
      maxOversPerBowler,
      matchType: format,
      venue,
      matchDate: new Date().toISOString().split("T")[0],
    };

    const inn1 = createInitialInnings(
      battingFirstTeam,
      bowlingFirstTeam,
      battingFirstTeam.players[0]?.id || "p1",
      battingFirstTeam.players[1]?.id || "p2",
      bowlingFirstTeam.players[bowlingFirstTeam.players.length - 1]?.id || "b1"
    );

    const inn2 = createInitialInnings(
      bowlingFirstTeam,
      battingFirstTeam,
      bowlingFirstTeam.players[0]?.id || "p1",
      bowlingFirstTeam.players[1]?.id || "p2",
      battingFirstTeam.players[battingFirstTeam.players.length - 1]?.id || "b1"
    );

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings,
      teams: { teamA, teamB },
      toss: { winnerTeamId: tossWinnerId, decision: tossDecision },
      status: "innings_1",
      currentInningsIndex: 0,
      innings: [inn1, inn2],
    };

    sounds.vibrate(50);
    sounds.playVictory();
    onCreateMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1624] border border-emerald-500/30 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Match</h2>
              <p className="text-xs text-slate-400">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`h-1.5 rounded-full ${
              step >= 1 ? "bg-emerald-500" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full ${
              step >= 2 ? "bg-emerald-500" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full ${
              step >= 3 ? "bg-emerald-500" : "bg-slate-800"
            }`}
          />
        </div>

        {/* STEP 1: Format & Match Details */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Match Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Club Championship Final"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Venue / Ground:
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Lords / Local Ground"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Match Format Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {formatPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectFormat(p)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition tap-btn ${
                      format === p.id
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                        : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/70"
                    }`}
                  >
                    <span className="text-xs">{p.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.overs} ov &bull; max {p.maxBowlerOvers}/bowler
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Total Overs:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxOvers}
                  onChange={(e) => setMaxOvers(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Max Ov/Bowler:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxOversPerBowler}
                  onChange={(e) => setMaxOversPerBowler(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Balls Per Over:</label>
                <input
                  type="number"
                  min="4"
                  max="8"
                  value={ballsPerOver}
                  onChange={(e) => setBallsPerOver(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Teams & Players */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Team A */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Team A Details:
              </span>
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  placeholder="Team A Name"
                  className="col-span-7 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={teamAShort}
                  onChange={(e) => setTeamAShort(e.target.value)}
                  placeholder="Short"
                  className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none uppercase"
                />
                <input
                  type="text"
                  value={teamAEmoji}
                  onChange={(e) => setTeamAEmoji(e.target.value)}
                  placeholder="Logo"
                  className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-center text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Team A Squad (comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={teamAPlayersText}
                  onChange={(e) => setTeamAPlayersText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Team B */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Team B Details:
              </span>
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  placeholder="Team B Name"
                  className="col-span-7 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={teamBShort}
                  onChange={(e) => setTeamBShort(e.target.value)}
                  placeholder="Short"
                  className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none uppercase"
                />
                <input
                  type="text"
                  value={teamBEmoji}
                  onChange={(e) => setTeamBEmoji(e.target.value)}
                  placeholder="Logo"
                  className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-center text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Team B Squad (comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={teamBPlayersText}
                  onChange={(e) => setTeamBPlayersText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Toss & Confirmation */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Toss Outcome:
              </span>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Who won the toss?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTossWinner("teamA")}
                    className={`p-3 rounded-xl border text-center transition tap-btn ${
                      tossWinner === "teamA"
                        ? "bg-sky-500/20 border-sky-400 text-sky-200 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{teamAEmoji}</span> {teamAName}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTossWinner("teamB")}
                    className={`p-3 rounded-xl border text-center transition tap-btn ${
                      tossWinner === "teamB"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{teamBEmoji}</span> {teamBName}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Elected to:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTossDecision("bat")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition tap-btn ${
                      tossDecision === "bat"
                        ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    🏏 Bat First
                  </button>

                  <button
                    type="button"
                    onClick={() => setTossDecision("bowl")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition tap-btn ${
                      tossDecision === "bowl"
                        ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    🎯 Bowl First
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              ✓ Ready to start! Openers will be automatically assigned from the squad and can be
              freely customized on the live scoring board anytime.
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 tap-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold tap-btn"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 tap-btn"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 tap-btn"
            >
              <Check className="w-4 h-4" /> Start Live Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
