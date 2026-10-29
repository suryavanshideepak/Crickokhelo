export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run_out"
  | "stumped"
  | "hit_wicket"
  | "retired_hurt"
  | "retired_out"
  | "hit_ball_twice"
  | "obstructing";

export type ExtraType = "none" | "wide" | "no_ball" | "bye" | "leg_bye" | "penalty";

export type ShotZone =
  | "straight"
  | "long_on"
  | "mid_wicket"
  | "square_leg"
  | "fine_leg"
  | "third_man"
  | "point"
  | "cover"
  | "long_off";

export interface ShotCoordinates {
  x: number; // 0 to 100 percentage relative to field center
  y: number; // 0 to 100 percentage relative to field center
  zone?: ShotZone;
}

export interface Player {
  id: string;
  name: string;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  avatarColor?: string;
}

export interface BatterStats {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: {
    type: DismissalType;
    bowlerId?: string;
    fielderId?: string;
    text: string;
    over: number;
    ball: number;
  };
}

export interface BowlerStats {
  overs: number; // calculated as full overs + (balls % 6)/10
  ballsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  dotBalls: number;
}

export interface BallRecord {
  id: string;
  ballNumber: number; // absolute ball in innings
  overNumber: number; // 0-indexed over (0 = 1st over)
  ballInOver: number; // 1-indexed legal ball (1 to 6)
  isLegal: boolean; // false for wide / no-ball
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsOffBat: number;
  extraType: ExtraType;
  extraRuns: number;
  totalRuns: number;
  isWicket: boolean;
  dismissal?: {
    type: DismissalType;
    outPlayerId: string;
    bowlerId?: string;
    fielderId?: string;
    text: string;
  };
  shotZone?: ShotZone;
  shotCoordinates?: ShotCoordinates;
  commentary: string;
  timestamp: number;
  cumulativeScore: number;
  cumulativeWickets: number;
}

export interface OverSummary {
  overNumber: number;
  bowlerId: string;
  balls: BallRecord[];
  totalRuns: number;
  wickets: number;
  isMaiden: boolean;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  playerId: string;
  playerRuns: number;
  playerBalls: number;
}

export interface Partnership {
  batsman1Id: string;
  batsman2Id: string;
  runs: number;
  balls: number;
  b1Runs: number;
  b1Balls: number;
  b2Runs: number;
  b2Balls: number;
  isCurrent: boolean;
}

export interface ExtrasBreakdown {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalties: number;
  total: number;
}

export interface Innings {
  id: string;
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  balls: number; // legal balls bowled
  target?: number;
  isDeclared: boolean;
  isCompleted: boolean;
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  previousBowlerId?: string;
  batterStats: Record<string, BatterStats>;
  bowlerStats: Record<string, BowlerStats>;
  extras: ExtrasBreakdown;
  ballHistory: BallRecord[];
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  dnbPlayerIds: string[]; // Did not bat
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logoEmoji: string;
  players: Player[];
}

export type MatchType = "t20" | "odi" | "10_over" | "5_over" | "custom";

export interface MatchSettings {
  maxOvers: number;
  ballsPerOver: number;
  maxOversPerBowler: number;
  matchType: MatchType;
  venue: string;
  matchDate: string;
  groundType?: string;
}

export interface TossDetails {
  winnerTeamId: string;
  decision: "bat" | "bowl";
}

export type MatchStatus = "not_started" | "innings_1" | "innings_break" | "innings_2" | "completed";

export interface MatchResult {
  winnerTeamId: string | "tie" | "draw" | "no_result";
  margin: string; // e.g., "by 24 runs" or "by 6 wickets"
  summary: string;
  playerOfTheMatchId?: string;
}

export interface Match {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  settings: MatchSettings;
  teams: {
    teamA: Team;
    teamB: Team;
  };
  toss: TossDetails;
  status: MatchStatus;
  currentInningsIndex: 0 | 1;
  innings: [Innings, Innings];
  result?: MatchResult;
}
