# 🏏 OpenCricket Pro

An open-source, mobile-first cricket scoring web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Web Audio API**. Designed for grassroot clubs, tournaments, gully/box cricket, and international broadcast-style tracking.

---

## 🌟 Key Features

### 1. 📱 Mobile-First Touch Scoring Console
- **Extra-large tap buttons** for 0, 1, 2, 3, 4, and 6 runs with haptic vibration feedback (`navigator.vibrate`).
- **One-tap Extras**: Wide (`Wd`), No-ball (`Nb`), Bye (`B`), Leg Bye (`Lb`), and +5 Penalty runs.
- **Detailed Extras Submenu**: Wide + runs, No-ball + boundaries, byes, and penalties.
- **Wicket Dismissal Dialog**: Bowled, Caught, LBW, Run Out (striker vs non-striker selection with completed runs), Stumped, Hit Wicket, Retired Hurt.
- **Auto Strike Rotation**: Odd runs and end of over automatically rotate the strike.
- **Manual Quick Controls**: 1-tap "Swap Strike", "Change Bowler", and instantaneous "Undo" to revert any scoring mistake.

### 2. ⚡ Live Broadcast Hero Banner
- Real-time Score (`Runs/Wickets`) and Overs display.
- **Current Run Rate (CRR)** and **Required Run Rate (RRR)** in 2nd innings.
- Dynamic chase scenario: Target, runs needed, balls remaining, and percentage chase progress bar.
- **Striker Card**: Active indicator (`*`), Runs, Balls faced, 4s, 6s, and Strike Rate.
- **Non-Striker Card**: Companion batsman figures.
- **Bowler Figures**: Overs, Maidens, Runs conceded, Wickets taken (`O-M-R-W`), Dots, and Economy rate.

### 3. 📊 Interactive Visual Analytics & Charts
- **Worm Chart**: Compare 1st innings vs 2nd innings cumulative scoring progression across overs with red wicket markers and target line.
- **Manhattan Chart**: Over-by-over run production bars with wicket indicators.
- **Partnerships Breakdown**: Visual partnership bars for every wicket fallen.
- **Interactive 2D Wagon Wheel**: 2D cricket turf diagram with 30-yard circle, pitch, boundary rope, radiating shot direction rays color-coded by runs (purple for 6s, blue for 4s, green for 1s/2s), and off-side vs leg-side percentage distribution.

### 4. 📋 Official Cricket Scorecard
- Innings 1 and Innings 2 toggle views.
- **Batting Table**: Batter, Dismissal description, Runs, Balls, 4s, 6s, and Strike Rate.
- **Extras Line**: Itemized breakdown of byes, leg-byes, wides, no-balls, and penalties.
- **Fall of Wickets (FOW)**: Complete timeline (e.g. `1-56 (Travis Head, 6.4 ov)`).
- **Bowling Table**: Bowler, Overs, Maidens, Runs, Wickets, Economy, Dot balls.
- **Did Not Bat (DNB)** list.

### 5. 🎙️ Ball-by-Ball Natural Commentary
- Contextual commentary generator describing boundaries, dismissals, tight overs, and milestone achievements.
- Over-by-over markers and cumulative score at each delivery.
- Real-time search filter by player name, boundary, or wicket.

### 6. 🏆 Match Setup & Multi-Match Archive
- **3-Step New Match Wizard**:
  - Formats: T20, ODI, 10-Over Slam, 5-Over Blitz, Box/Gully Cricket.
  - Custom overs, balls per over, max overs per bowler, and venue.
  - Team A & Team B squads with Captain (c) and Wicketkeeper (wk) tags.
  - Toss winner and decision (Bat / Bowl).
- **Preloaded Thriller Demo Match**: One-click load for an IND vs AUS T20 final (188/5 vs 172/4 in 18.2 overs) for instant testing!
- **Local Storage Persistence**: Auto-saves every single ball to browser `localStorage`.
- **Match Archive**: Resume or delete past matches anytime.
- **Export & Import JSON**: Download match backups or import community scorecards.
- **Share**: One-click formatted WhatsApp / SMS scorecard snippet and print-to-PDF layout.

### 7. 🔊 Web Audio Synthesizer & Confetti Celebrations
- Synthesized audio effects (bat sound, boundary fanfare, sixer boom, wicket crash, victory anthem) using native Web Audio API — **100% offline with zero external audio asset dependencies**.
- Mute/unmute toggle in navbar.
- Confetti bursts on boundaries, milestones (50s, 100s), and match victory.

---

## ⌨️ Desktop Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0` - `6` (except 5) | Score Runs off Bat |
| `W` | Wide Ball (+1) |
| `N` | No Ball (+1) |
| `O` | Open Wicket Dismissal Modal |
| `U` | Undo Last Ball |
| `S` | Swap Striker End |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+

### Installation

```bash
# Navigate to the project
cd cricket-app

# Install dependencies (if not already installed)
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser (desktop, tablet, or mobile).

### Production Build

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
cricket-app/
├── src/
│   ├── app/
│   │   ├── globals.css         # Stadium theme, animations & glassmorphism
│   │   ├── layout.tsx          # SEO metadata, mobile viewport configuration
│   │   └── page.tsx            # Main application controller & tabs
│   ├── components/
│   │   ├── Navbar.tsx          # Top bar with sound, demo, archive & export
│   │   ├── LiveScoreBanner.tsx # Live scoreboard hero banner
│   │   ├── ScoringConsole.tsx  # Mobile-friendly scoring keypad
│   │   ├── CelebrationToast.tsx# Milestone & boundary animated alerts
│   │   ├── MatchArchive.tsx    # Saved matches drawer
│   │   ├── Modals/
│   │   │   ├── BowlerModal.tsx      # Next bowler selector
│   │   │   ├── InningsBreakModal.tsx# 2nd innings chase transition
│   │   │   ├── NewMatchModal.tsx    # 3-step match setup wizard
│   │   │   ├── ShareModal.tsx       # JSON export/import & share snippet
│   │   │   ├── ShotZoneModal.tsx    # Wagon wheel shot tagger
│   │   │   └── WicketModal.tsx      # Comprehensive dismissal modal
│   │   └── Tabs/
│   │       ├── ChartsTab.tsx    # SVG Worm, Manhattan, & Partnership charts
│   │       ├── CommentaryTab.tsx# Ball-by-ball timeline stream
│   │       ├── ScorecardTab.tsx # Official international scorecard
│   │       ├── TeamsTab.tsx     # Playing XI & match information
│   │       └── WagonWheelTab.tsx# Interactive 2D cricket ground graphic
│   ├── types/
│   │   └── cricket.ts          # Complete cricket scoring TypeScript models
│   └── utils/
│       ├── audio.ts            # Web Audio API sound synthesizer
│       ├── commentary.ts       # Contextual commentary generator
│       ├── confetti.ts         # Canvas confetti milestone celebrations
│       ├── demoMatch.ts        # Pre-loaded IND vs AUS thriller match
│       ├── engine.ts           # Core cricket scoring & rules engine
│       └── storage.ts          # LocalStorage persistence & share utilities
├── package.json
└── tsconfig.json
```

---

## 📜 License

Open source under the [MIT License](LICENSE). Contributions, feature requests, and bug reports are welcome!
