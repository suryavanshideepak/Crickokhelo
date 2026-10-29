import { Match } from "@/types/cricket";
import { generateDemoMatch } from "./demoMatch";

const ACTIVE_MATCH_KEY = "opencricket_active_match";
const ARCHIVE_MATCHES_KEY = "opencricket_matches_archive";

export function loadActiveMatch(): Match {
  if (typeof window === "undefined") {
    return generateDemoMatch();
  }

  try {
    const raw = localStorage.getItem(ACTIVE_MATCH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.innings) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load active match from localStorage:", e);
  }

  const defaultMatch = generateDemoMatch();
  saveActiveMatch(defaultMatch);
  return defaultMatch;
}

export function saveActiveMatch(match: Match): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
    saveToArchive(match);
  } catch (e) {
    console.error("Failed to save active match:", e);
  }
}

export function saveToArchive(match: Match): void {
  if (typeof window === "undefined") return;
  try {
    const archive = loadArchive();
    const existingIndex = archive.findIndex((m) => m.id === match.id);
    if (existingIndex >= 0) {
      archive[existingIndex] = match;
    } else {
      archive.unshift(match);
    }
    // keep top 20 matches
    localStorage.setItem(ARCHIVE_MATCHES_KEY, JSON.stringify(archive.slice(0, 20)));
  } catch (e) {
    console.error("Failed to save to archive:", e);
  }
}

export function loadArchive(): Match[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVE_MATCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load archive:", e);
  }
  return [];
}

export function deleteArchivedMatch(id: string): Match[] {
  const archive = loadArchive().filter((m) => m.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(ARCHIVE_MATCHES_KEY, JSON.stringify(archive));
  }
  return archive;
}

export function exportMatchAsJSON(match: Match): void {
  const jsonStr = JSON.stringify(match, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${match.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_scorecard.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateMatchShareText(match: Match): string {
  const inn1 = match.innings[0];
  const inn2 = match.innings[1];
  const team1 = match.teams.teamA.id === inn1.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const team2 = match.teams.teamA.id === inn2.battingTeamId ? match.teams.teamA : match.teams.teamB;

  const inn1Overs = `${Math.floor(inn1.balls / 6)}.${inn1.balls % 6}`;
  const inn2Overs = `${Math.floor(inn2.balls / 6)}.${inn2.balls % 6}`;

  let text = `🏏 ${match.title}\n📍 ${match.settings.venue} | ${match.settings.maxOvers} Overs\n\n`;
  text += `${team1.logoEmoji} ${team1.shortName}: ${inn1.runs}/${inn1.wickets} (${inn1Overs} ov)\n`;

  if (match.status === "innings_2" || match.status === "completed") {
    text += `${team2.logoEmoji} ${team2.shortName}: ${inn2.runs}/${inn2.wickets} (${inn2Overs} ov)\n`;
    if (match.result) {
      text += `\n🏆 Result: ${match.result.summary}\n`;
    } else if (inn2.target) {
      const needed = Math.max(0, inn2.target - inn2.runs);
      const ballsLeft = match.settings.maxOvers * match.settings.ballsPerOver - inn2.balls;
      text += `\n🔥 Target: ${inn2.target} | Need ${needed} off ${ballsLeft} balls\n`;
    }
  }

  const activeInn = match.innings[match.currentInningsIndex];
  const striker = (activeInn.battingTeamId === team1.id ? team1 : team2).players.find(
    (p) => p.id === activeInn.strikerId
  );
  const strikerStats = striker ? activeInn.batterStats[striker.id] : null;
  if (strikerStats) {
    text += `⚡ Striker: ${striker?.name} ${strikerStats.runs}* (${strikerStats.balls})\n`;
  }

  text += `\nScored live via OpenCricket 📱`;
  return text;
}
