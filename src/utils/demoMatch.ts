import { Match, BallRecord, BatterStats, BowlerStats, Innings, Team } from "@/types/cricket";

export const demoTeamIndia: Team = {
  id: "team_ind",
  name: "India",
  shortName: "IND",
  color: "#0284c7",
  logoEmoji: "🇮🇳",
  players: [
    { id: "ind_1", name: "Rohit Sharma", isCaptain: true, avatarColor: "#0284c7" },
    { id: "ind_2", name: "Virat Kohli", avatarColor: "#0369a1" },
    { id: "ind_3", name: "Suryakumar Yadav", avatarColor: "#0284c7" },
    { id: "ind_4", name: "Rishabh Pant", isWicketKeeper: true, avatarColor: "#0369a1" },
    { id: "ind_5", name: "Hardik Pandya", avatarColor: "#0284c7" },
    { id: "ind_6", name: "Ravindra Jadeja", avatarColor: "#0369a1" },
    { id: "ind_7", name: "Axar Patel", avatarColor: "#0284c7" },
    { id: "ind_8", name: "Kuldeep Yadav", avatarColor: "#0369a1" },
    { id: "ind_9", name: "Arshdeep Singh", avatarColor: "#0284c7" },
    { id: "ind_10", name: "Jasprit Bumrah", avatarColor: "#0369a1" },
    { id: "ind_11", name: "Mohammed Siraj", avatarColor: "#0284c7" },
  ],
};

export const demoTeamAustralia: Team = {
  id: "team_aus",
  name: "Australia",
  shortName: "AUS",
  color: "#eab308",
  logoEmoji: "🇦🇺",
  players: [
    { id: "aus_1", name: "Travis Head", avatarColor: "#ca8a04" },
    { id: "aus_2", name: "David Warner", avatarColor: "#eab308" },
    { id: "aus_3", name: "Mitchell Marsh", isCaptain: true, avatarColor: "#ca8a04" },
    { id: "aus_4", name: "Glenn Maxwell", avatarColor: "#eab308" },
    { id: "aus_5", name: "Marcus Stoinis", avatarColor: "#ca8a04" },
    { id: "aus_6", name: "Tim David", avatarColor: "#eab308" },
    { id: "aus_7", name: "Matthew Wade", isWicketKeeper: true, avatarColor: "#ca8a04" },
    { id: "aus_8", name: "Pat Cummins", avatarColor: "#eab308" },
    { id: "aus_9", name: "Mitchell Starc", avatarColor: "#ca8a04" },
    { id: "aus_10", name: "Adam Zampa", avatarColor: "#eab308" },
    { id: "aus_11", name: "Josh Hazlewood", avatarColor: "#ca8a04" },
  ],
};

export function createInitialInnings(
  battingTeam: Team,
  bowlingTeam: Team,
  strikerId: string,
  nonStrikerId: string,
  currentBowlerId: string,
  target?: number
): Innings {
  const batterStats: Record<string, BatterStats> = {};
  battingTeam.players.forEach((p) => {
    batterStats[p.id] = {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
    };
  });

  const bowlerStats: Record<string, BowlerStats> = {};
  bowlingTeam.players.forEach((p) => {
    bowlerStats[p.id] = {
      overs: 0,
      ballsBowled: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      dotBalls: 0,
    };
  });

  const dnbPlayerIds = battingTeam.players
    .map((p) => p.id)
    .filter((id) => id !== strikerId && id !== nonStrikerId);

  return {
    id: `inn_${Date.now()}_${battingTeam.id}`,
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    runs: 0,
    wickets: 0,
    balls: 0,
    target,
    isDeclared: false,
    isCompleted: false,
    strikerId,
    nonStrikerId,
    currentBowlerId,
    batterStats,
    bowlerStats,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
    ballHistory: [],
    fallOfWickets: [],
    partnerships: [
      {
        batsman1Id: strikerId,
        batsman2Id: nonStrikerId,
        runs: 0,
        balls: 0,
        b1Runs: 0,
        b1Balls: 0,
        b2Runs: 0,
        b2Balls: 0,
        isCurrent: true,
      },
    ],
    dnbPlayerIds,
  };
}

export function generateDemoMatch(): Match {
  // Generates a match: India (188/5 in 20 ov) vs Australia (172/4 in 18.2 ov) - Thrilling chase!
  const inn1 = createInitialInnings(demoTeamIndia, demoTeamAustralia, "ind_1", "ind_2", "aus_9");
  inn1.runs = 188;
  inn1.wickets = 5;
  inn1.balls = 120; // 20.0 overs
  inn1.isCompleted = true;
  inn1.extras = { wides: 5, noBalls: 1, byes: 2, legByes: 4, penalties: 0, total: 12 };

  // Set India Batter stats
  inn1.batterStats["ind_1"] = {
    runs: 57,
    balls: 34,
    fours: 6,
    sixes: 3,
    isOut: true,
    dismissal: { type: "caught", bowlerId: "aus_10", fielderId: "aus_8", text: "c Cummins b Zampa", over: 10, ball: 2 },
  };
  inn1.batterStats["ind_2"] = {
    runs: 76,
    balls: 48,
    fours: 7,
    sixes: 4,
    isOut: false,
  };
  inn1.batterStats["ind_3"] = {
    runs: 24,
    balls: 14,
    fours: 2,
    sixes: 2,
    isOut: true,
    dismissal: { type: "bowled", bowlerId: "aus_9", text: "b Starc", over: 14, ball: 5 },
  };
  inn1.batterStats["ind_4"] = {
    runs: 12,
    balls: 9,
    fours: 1,
    sixes: 0,
    isOut: true,
    dismissal: { type: "caught", bowlerId: "aus_8", fielderId: "aus_7", text: "c Wade b Cummins", over: 17, ball: 3 },
  };
  inn1.batterStats["ind_5"] = {
    runs: 18,
    balls: 11,
    fours: 1,
    sixes: 1,
    isOut: true,
    dismissal: { type: "run_out", fielderId: "aus_1", text: "run out (Head)", over: 19, ball: 4 },
  };
  inn1.batterStats["ind_6"] = {
    runs: 1,
    balls: 4,
    fours: 0,
    sixes: 0,
    isOut: false,
  };

  inn1.fallOfWickets = [
    { wicketNumber: 1, score: 78, overs: "10.2", playerId: "ind_1", playerRuns: 57, playerBalls: 34 },
    { wicketNumber: 2, score: 122, overs: "14.5", playerId: "ind_3", playerRuns: 24, playerBalls: 14 },
    { wicketNumber: 3, score: 149, overs: "17.3", playerId: "ind_4", playerRuns: 12, playerBalls: 9 },
    { wicketNumber: 4, score: 178, overs: "19.4", playerId: "ind_5", playerRuns: 18, playerBalls: 11 },
  ];

  // Australia Bowling stats
  inn1.bowlerStats["aus_9"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 42, wickets: 1, wides: 2, noBalls: 0, dotBalls: 8 };
  inn1.bowlerStats["aus_11"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 31, wickets: 0, wides: 1, noBalls: 0, dotBalls: 10 };
  inn1.bowlerStats["aus_8"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 38, wickets: 1, wides: 0, noBalls: 1, dotBalls: 9 };
  inn1.bowlerStats["aus_10"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 34, wickets: 1, wides: 1, noBalls: 0, dotBalls: 7 };
  inn1.bowlerStats["aus_5"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 39, wickets: 0, wides: 1, noBalls: 0, dotBalls: 6 };

  // Innings 2: Australia chasing 189
  const inn2 = createInitialInnings(demoTeamAustralia, demoTeamIndia, "aus_3", "aus_5", "ind_10", 189);
  inn2.runs = 172;
  inn2.wickets = 4;
  inn2.balls = 110; // 18.2 overs - 17 needed off 10 balls!
  inn2.isCompleted = false;
  inn2.strikerId = "aus_3"; // Mitchell Marsh 64* (38)
  inn2.nonStrikerId = "aus_5"; // Marcus Stoinis 22* (11)
  inn2.currentBowlerId = "ind_10"; // Jasprit Bumrah
  inn2.extras = { wides: 3, noBalls: 0, byes: 1, legByes: 2, penalties: 0, total: 6 };

  inn2.batterStats["aus_1"] = {
    runs: 41,
    balls: 26,
    fours: 5,
    sixes: 2,
    isOut: true,
    dismissal: { type: "bowled", bowlerId: "ind_10", text: "b Bumrah", over: 6, ball: 4 },
  };
  inn2.batterStats["aus_2"] = {
    runs: 18,
    balls: 15,
    fours: 2,
    sixes: 0,
    isOut: true,
    dismissal: { type: "caught", bowlerId: "ind_9", fielderId: "ind_4", text: "c Pant b Arshdeep", over: 8, ball: 5 },
  };
  inn2.batterStats["aus_3"] = {
    runs: 64,
    balls: 38,
    fours: 5,
    sixes: 4,
    isOut: false,
  };
  inn2.batterStats["aus_4"] = {
    runs: 19,
    balls: 12,
    fours: 1,
    sixes: 1,
    isOut: true,
    dismissal: { type: "lbw", bowlerId: "ind_8", text: "lbw b Kuldeep", over: 13, ball: 3 },
  };
  inn2.batterStats["aus_5"] = {
    runs: 22,
    balls: 11,
    fours: 2,
    sixes: 1,
    isOut: false,
  };

  inn2.fallOfWickets = [
    { wicketNumber: 1, score: 56, overs: "6.4", playerId: "aus_1", playerRuns: 41, playerBalls: 26 },
    { wicketNumber: 2, score: 79, overs: "8.5", playerId: "aus_2", playerRuns: 18, playerBalls: 15 },
    { wicketNumber: 3, score: 129, overs: "13.3", playerId: "aus_4", playerRuns: 19, playerBalls: 12 },
  ];

  inn2.bowlerStats["ind_10"] = { overs: 3.2, ballsBowled: 20, maidens: 0, runsConceded: 22, wickets: 1, wides: 0, noBalls: 0, dotBalls: 11 };
  inn2.bowlerStats["ind_9"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 38, wickets: 1, wides: 1, noBalls: 0, dotBalls: 8 };
  inn2.bowlerStats["ind_8"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 35, wickets: 1, wides: 1, noBalls: 0, dotBalls: 7 };
  inn2.bowlerStats["ind_5"] = { overs: 3, ballsBowled: 18, maidens: 0, runsConceded: 32, wickets: 0, wides: 1, noBalls: 0, dotBalls: 4 };
  inn2.bowlerStats["ind_6"] = { overs: 4, ballsBowled: 24, maidens: 0, runsConceded: 42, wickets: 0, wides: 0, noBalls: 0, dotBalls: 5 };

  // Sample historical balls for timeline, worm chart, and wagon wheel
  const sampleBalls: BallRecord[] = [
    {
      id: "b_1",
      ballNumber: 105,
      overNumber: 17,
      ballInOver: 1,
      isLegal: true,
      strikerId: "aus_3",
      nonStrikerId: "aus_5",
      bowlerId: "ind_9",
      runsOffBat: 2,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 2,
      isWicket: false,
      shotZone: "cover",
      shotCoordinates: { x: 70, y: 35, zone: "cover" },
      commentary: "2 runs. Mitchell Marsh drives gracefully through extra cover and hurries back for a brace.",
      timestamp: Date.now() - 180000,
      cumulativeScore: 158,
      cumulativeWickets: 3,
    },
    {
      id: "b_2",
      ballNumber: 106,
      overNumber: 17,
      ballInOver: 2,
      isLegal: true,
      strikerId: "aus_3",
      nonStrikerId: "aus_5",
      bowlerId: "ind_9",
      runsOffBat: 4,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 4,
      isWicket: false,
      shotZone: "mid_wicket",
      shotCoordinates: { x: 25, y: 70, zone: "mid_wicket" },
      commentary: "FOUR! Mitchell Marsh picks the slower ball and hoicks it over mid-wicket for a cracking boundary!",
      timestamp: Date.now() - 150000,
      cumulativeScore: 162,
      cumulativeWickets: 3,
    },
    {
      id: "b_3",
      ballNumber: 107,
      overNumber: 17,
      ballInOver: 3,
      isLegal: true,
      strikerId: "aus_3",
      nonStrikerId: "aus_5",
      bowlerId: "ind_9",
      runsOffBat: 1,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 1,
      isWicket: false,
      shotZone: "long_on",
      shotCoordinates: { x: 45, y: 88, zone: "long_on" },
      commentary: "1 run. Pushed down to long-on to give Stoinis the strike.",
      timestamp: Date.now() - 120000,
      cumulativeScore: 163,
      cumulativeWickets: 3,
    },
    {
      id: "b_4",
      ballNumber: 108,
      overNumber: 17,
      ballInOver: 4,
      isLegal: true,
      strikerId: "aus_5",
      nonStrikerId: "aus_3",
      bowlerId: "ind_9",
      runsOffBat: 6,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 6,
      isWicket: false,
      shotZone: "long_off",
      shotCoordinates: { x: 55, y: 12, zone: "long_off" },
      commentary: "SIX! MARCUS STOINIS LAUNCHES IT! Full and in the slot, clobbered 94 meters over long-off!",
      timestamp: Date.now() - 90000,
      cumulativeScore: 169,
      cumulativeWickets: 3,
    },
    {
      id: "b_5",
      ballNumber: 109,
      overNumber: 18,
      ballInOver: 1,
      isLegal: true,
      strikerId: "aus_3",
      nonStrikerId: "aus_5",
      bowlerId: "ind_10",
      runsOffBat: 1,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 1,
      isWicket: false,
      shotZone: "point",
      shotCoordinates: { x: 85, y: 50, zone: "point" },
      commentary: "1 run. Jasprit Bumrah starts with a pinpoint yorker at 145 clicks! Dug out to deep point.",
      timestamp: Date.now() - 50000,
      cumulativeScore: 170,
      cumulativeWickets: 3,
    },
    {
      id: "b_6",
      ballNumber: 110,
      overNumber: 18,
      ballInOver: 2,
      isLegal: true,
      strikerId: "aus_5",
      nonStrikerId: "aus_3",
      bowlerId: "ind_10",
      runsOffBat: 2,
      extraType: "none",
      extraRuns: 0,
      totalRuns: 2,
      isWicket: false,
      shotZone: "fine_leg",
      shotCoordinates: { x: 18, y: 80, zone: "fine_leg" },
      commentary: "2 runs. Stoinis clips off the pads through fine leg. Hard running puts Australia on 172/3!",
      timestamp: Date.now() - 10000,
      cumulativeScore: 172,
      cumulativeWickets: 3,
    },
  ];

  inn2.ballHistory = sampleBalls;

  return {
    id: "match_world_t20_thriller",
    title: "T20 Championship Final: IND vs AUS",
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now(),
    settings: {
      maxOvers: 20,
      ballsPerOver: 6,
      maxOversPerBowler: 4,
      matchType: "t20",
      venue: "Kensington Oval, Bridgetown",
      matchDate: new Date().toISOString().split("T")[0],
    },
    teams: {
      teamA: demoTeamIndia,
      teamB: demoTeamAustralia,
    },
    toss: {
      winnerTeamId: "team_ind",
      decision: "bat",
    },
    status: "innings_2",
    currentInningsIndex: 1,
    innings: [inn1, inn2],
  };
}
