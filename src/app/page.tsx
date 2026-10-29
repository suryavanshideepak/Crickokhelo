"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Match, ShotZone } from "@/types/cricket";
import {
  loadActiveMatch,
  saveActiveMatch,
} from "@/utils/storage";
import { generateDemoMatch } from "@/utils/demoMatch";
import {
  recordBall,
  swapStriker,
  changeBowler,
  setNewBatsman,
  startSecondInnings,
  undoLastBall,
  BallInput,
} from "@/utils/engine";
import { sounds } from "@/utils/audio";
import {
  fireFourCelebration,
  fireSixCelebration,
  fireMilestoneCelebration,
  fireVictoryCelebration,
} from "@/utils/confetti";

import Navbar from "@/components/Navbar";
import LiveScoreBanner from "@/components/LiveScoreBanner";
import ScoringConsole from "@/components/ScoringConsole";
import ScorecardTab from "@/components/Tabs/ScorecardTab";
import CommentaryTab from "@/components/Tabs/CommentaryTab";
import ChartsTab from "@/components/Tabs/ChartsTab";
import WagonWheelTab from "@/components/Tabs/WagonWheelTab";
import TeamsTab from "@/components/Tabs/TeamsTab";

import WicketModal from "@/components/Modals/WicketModal";
import BowlerModal from "@/components/Modals/BowlerModal";
import ShotZoneModal from "@/components/Modals/ShotZoneModal";
import InningsBreakModal from "@/components/Modals/InningsBreakModal";
import NewMatchModal from "@/components/Modals/NewMatchModal";
import ShareModal from "@/components/Modals/ShareModal";
import MatchArchive from "@/components/MatchArchive";
import CelebrationToast from "@/components/CelebrationToast";

import {
  Activity,
  FileSpreadsheet,
  MessageSquare,
  TrendingUp,
  Compass,
  Users,
} from "lucide-react";

type ActiveTab = "scoring" | "scorecard" | "commentary" | "charts" | "wagon_wheel" | "teams";

export default function Home() {
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("scoring");

  // Modals visibility states
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [isMandatoryBowlerChange, setIsMandatoryBowlerChange] = useState(false);
  const [showShotZoneModal, setShowShotZoneModal] = useState(false);
  const [showInningsBreakModal, setShowInningsBreakModal] = useState(false);
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Active shot zone tag
  const [activeShotZone, setActiveShotZone] = useState<ShotZone | undefined>(undefined);

  // Celebration toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "four" | "six" | "fifty" | "century" | "wicket" | "win";
  } | null>(null);

  // On mount: load active match or fallback to demo
  useEffect(() => {
    const loaded = loadActiveMatch();
    setMatch(loaded);
  }, []);

  // Sync match updates to storage
  const updateMatchState = useCallback((newMatch: Match) => {
    setMatch(newMatch);
    saveActiveMatch(newMatch);
  }, []);

  // Record a ball
  const handleRecordBall = (input: BallInput) => {
    if (!match) return;

    // Trigger celebration effects for 4 and 6
    if (input.runsOffBat === 4) {
      fireFourCelebration();
      setToast({ message: "FOUR! Gorgeous boundary cracked to the rope!", type: "four" });
    } else if (input.runsOffBat === 6) {
      fireSixCelebration();
      setToast({ message: "SIX! Dispatched high into the stands!", type: "six" });
    }

    const res = recordBall(match, input);
    updateMatchState(res.match);

    // Milestones celebrations
    if (res.milestoneReached === "fifty") {
      fireMilestoneCelebration();
      setToast({ message: "Fifty Milestone reached!", type: "fifty" });
    } else if (res.milestoneReached === "century") {
      fireMilestoneCelebration();
      setToast({ message: "Magnificent CENTURY reached!", type: "century" });
    } else if (res.milestoneReached === "match_won") {
      fireVictoryCelebration();
      sounds.playVictory();
      setToast({ message: res.eventNotification || "Match Won!", type: "win" });
    } else if (res.milestoneReached === "innings_break") {
      setShowInningsBreakModal(true);
    }

    // Over completed bowler prompt
    if (res.needsNewBowler) {
      sounds.playOverEnd();
      setIsMandatoryBowlerChange(true);
      setShowBowlerModal(true);
    }
  };

  // Undo last delivery
  const handleUndo = () => {
    if (!match) return;
    const restored = undoLastBall(match);
    updateMatchState(restored);
  };

  // Striker swap
  const handleSwapStrike = () => {
    if (!match) return;
    sounds.vibrate(30);
    const swapped = swapStriker(match);
    updateMatchState(swapped);
  };

  // Bowler selection
  const handleSelectBowler = (bowlerId: string) => {
    if (!match) return;
    const changed = changeBowler(match, bowlerId);
    updateMatchState(changed);
    setIsMandatoryBowlerChange(false);
  };

  // Wicket confirmed
  const handleConfirmWicket = (details: {
    dismissalType: any;
    outPlayerId: string;
    fielderId?: string;
    runsCompleted: number;
    newBatsmanId?: string;
  }) => {
    if (!match) return;

    handleRecordBall({
      runsOffBat: details.runsCompleted,
      extraType: "none",
      extraRuns: 0,
      isWicket: true,
      dismissalType: details.dismissalType,
      outPlayerId: details.outPlayerId,
      fielderId: details.fielderId,
      newBatsmanId: details.newBatsmanId,
      shotZone: activeShotZone,
    });

    setActiveShotZone(undefined);
    setToast({ message: "WICKET! Big breakthrough!", type: "wicket" });
  };

  // Start 2nd innings
  const handleStartSecondInnings = (
    strikerId: string,
    nonStrikerId: string,
    openingBowlerId: string
  ) => {
    if (!match) return;
    const updated = startSecondInnings(match, strikerId, nonStrikerId, openingBowlerId);
    updateMatchState(updated);
    setShowInningsBreakModal(false);
  };

  // Load demo match
  const handleLoadDemo = () => {
    const demo = generateDemoMatch();
    updateMatchState(demo);
    setActiveTab("scoring");
    setToast({ message: "Loaded India vs Australia Thriller Match Demo!", type: "win" });
  };

  // Reset match
  const handleResetMatch = () => {
    if (confirm("Reset current match to initial state?")) {
      const demo = generateDemoMatch();
      updateMatchState(demo);
    }
  };

  // Keyboard shortcuts for desktop scoring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key >= "0" && e.key <= "6" && e.key !== "5") {
        handleRecordBall({
          runsOffBat: parseInt(e.key, 10),
          extraType: "none",
          extraRuns: 0,
          isWicket: false,
          shotZone: activeShotZone,
        });
        setActiveShotZone(undefined);
      } else if (e.key === "w" || e.key === "W") {
        handleRecordBall({
          runsOffBat: 0,
          extraType: "wide",
          extraRuns: 0,
          isWicket: false,
        });
      } else if (e.key === "n" || e.key === "N") {
        handleRecordBall({
          runsOffBat: 0,
          extraType: "no_ball",
          extraRuns: 0,
          isWicket: false,
        });
      } else if (e.key === "o" || e.key === "O") {
        setShowWicketModal(true);
      } else if (e.key === "u" || e.key === "U") {
        handleUndo();
      } else if (e.key === "s" || e.key === "S") {
        handleSwapStrike();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match, activeShotZone]);

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm">
        Initializing OpenCricket scoring console...
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "scoring", label: "Live Scoring", icon: <Activity className="w-4 h-4" /> },
    { id: "scorecard", label: "Scorecard", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "commentary", label: "Commentary", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "charts", label: "Charts & Worm", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "wagon_wheel", label: "Wagon Wheel", icon: <Compass className="w-4 h-4" /> },
    { id: "teams", label: "Squads & Info", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070d14] text-slate-100 pb-20 sm:pb-8">
      {/* Top Navbar */}
      <Navbar
        matchTitle={match.title}
        onNewMatch={() => setShowNewMatchModal(true)}
        onOpenArchive={() => setShowArchive(true)}
        onOpenShare={() => setShowShareModal(true)}
        onLoadDemo={handleLoadDemo}
        onResetMatch={handleResetMatch}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 sm:gap-6 flex-1">
        {/* Live Score Banner */}
        <LiveScoreBanner
          match={match}
          onSwapStrike={handleSwapStrike}
          onChangeBowler={() => {
            setIsMandatoryBowlerChange(false);
            setShowBowlerModal(true);
          }}
          onOpenBowlerModal={() => {
            setIsMandatoryBowlerChange(false);
            setShowBowlerModal(true);
          }}
        />

        {/* Navigation Tabs (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800/80 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.vibrate(20);
                  setActiveTab(t.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition tap-btn ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="w-full">
          {activeTab === "scoring" && (
            <div className="flex flex-col gap-5">
              <ScoringConsole
                match={match}
                onRecordBall={handleRecordBall}
                onUndo={handleUndo}
                onOpenWicketModal={() => setShowWicketModal(true)}
                onOpenBowlerModal={() => {
                  setIsMandatoryBowlerChange(false);
                  setShowBowlerModal(true);
                }}
                onOpenShotZoneModal={() => setShowShotZoneModal(true)}
                activeShotZone={activeShotZone}
                onClearShotZone={() => setActiveShotZone(undefined)}
              />

              {/* Quick Scorecard Preview in Scoring view */}
              <div className="mt-2">
                <ScorecardTab match={match} />
              </div>
            </div>
          )}

          {activeTab === "scorecard" && <ScorecardTab match={match} />}

          {activeTab === "commentary" && <CommentaryTab match={match} />}

          {activeTab === "charts" && <ChartsTab match={match} />}

          {activeTab === "wagon_wheel" && <WagonWheelTab match={match} />}

          {activeTab === "teams" && <TeamsTab match={match} />}
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile Screens */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d14]/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab("scoring")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "scoring" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Scoring</span>
        </button>

        <button
          onClick={() => setActiveTab("scorecard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "scorecard" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Scorecard</span>
        </button>

        <button
          onClick={() => setActiveTab("commentary")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "commentary" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab("wagon_wheel")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === "wagon_wheel" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Field</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-400"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Share</span>
        </button>
      </nav>

      {/* Modals */}
      <WicketModal
        isOpen={showWicketModal}
        onClose={() => setShowWicketModal(false)}
        match={match}
        onConfirmWicket={handleConfirmWicket}
      />

      <BowlerModal
        isOpen={showBowlerModal}
        onClose={() => setShowBowlerModal(false)}
        match={match}
        onSelectBowler={handleSelectBowler}
        isMandatoryOverChange={isMandatoryBowlerChange}
      />

      <ShotZoneModal
        isOpen={showShotZoneModal}
        onClose={() => setShowShotZoneModal(false)}
        selectedZone={activeShotZone}
        onSelectZone={(zone) => setActiveShotZone(zone)}
      />

      <InningsBreakModal
        isOpen={showInningsBreakModal}
        match={match}
        onStartSecondInnings={handleStartSecondInnings}
      />

      <NewMatchModal
        isOpen={showNewMatchModal}
        onClose={() => setShowNewMatchModal(false)}
        onCreateMatch={(newM) => {
          updateMatchState(newM);
          setActiveTab("scoring");
        }}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        match={match}
        onImportMatch={(imported) => {
          updateMatchState(imported);
          setActiveTab("scoring");
        }}
      />

      <MatchArchive
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onSelectMatch={(m) => {
          updateMatchState(m);
          setActiveTab("scoring");
        }}
        onLoadDemo={handleLoadDemo}
      />

      {/* Toast Notification */}
      {toast && (
        <CelebrationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
