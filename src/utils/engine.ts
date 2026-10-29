import {
  Match,
  Innings,
  BallRecord,
  DismissalType,
  ExtraType,
  ShotZone,
  ShotCoordinates,
  FallOfWicket,
  Partnership,
  Team,
} from "@/types/cricket";
import { generateCommentary } from "./commentary";

export interface BallInput {
  runsOffBat: number;
  extraType: ExtraType;
  extraRuns: number;
  isWicket: boolean;
  dismissalType?: DismissalType;
  outPlayerId?: string;
  fielderId?: string;
  shotZone?: ShotZone;
  shotCoordinates?: ShotCoordinates;
  newBatsmanId?: string;
}

export interface EngineResult {
  match: Match;
  eventNotification?: string;
  milestoneReached?: "fifty" | "century" | "wicket" | "match_won" | "innings_break";
  needsNewBowler?: boolean;
  needsNewBatsman?: boolean;
}

export function recordBall(currentMatch: Match, input: BallInput): EngineResult {
  // Deep clone to guarantee immutability
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  const innIndex = match.currentInningsIndex;
  const inn: Innings = match.innings[innIndex];

  const battingTeam =
    match.teams.teamA.id === inn.battingTeamId ? match.teams.teamA : match.teams.teamB;
  const bowlingTeam =
    match.teams.teamA.id === inn.bowlingTeamId ? match.teams.teamA : match.teams.teamB;

  const striker = battingTeam.players.find((p) => p.id === inn.strikerId);
  const bowler = bowlingTeam.players.find((p) => p.id === inn.currentBowlerId);

  if (!striker || !bowler) {
    return { match, eventNotification: "Active striker or bowler not found." };
  }

  const { runsOffBat, extraType, extraRuns, isWicket, dismissalType, outPlayerId, fielderId, shotZone, shotCoordinates } = input;

  const isLegal = extraType !== "wide" && extraType !== "no_ball";
  let totalRunsThisBall = runsOffBat;

  if (extraType === "wide") {
    totalRunsThisBall = 1 + extraRuns; // 1 standard wide penalty + extras
    inn.extras.wides += 1 + extraRuns;
    inn.extras.total += 1 + extraRuns;
  } else if (extraType === "no_ball") {
    totalRunsThisBall = 1 + runsOffBat + extraRuns; // 1 nb penalty + bat runs/extras
    inn.extras.noBalls += 1;
    inn.extras.total += 1;
  } else if (extraType === "bye") {
    totalRunsThisBall = extraRuns;
    inn.extras.byes += extraRuns;
    inn.extras.total += extraRuns;
  } else if (extraType === "leg_bye") {
    totalRunsThisBall = extraRuns;
    inn.extras.legByes += extraRuns;
    inn.extras.total += extraRuns;
  } else if (extraType === "penalty") {
    totalRunsThisBall = extraRuns;
    inn.extras.penalties += extraRuns;
    inn.extras.total += extraRuns;
  }

  // Update total innings runs
  inn.runs += totalRunsThisBall;

  // Legal balls count
  if (isLegal) {
    inn.balls += 1;
  }

  // Update Batter Stats
  const batterStat = inn.batterStats[striker.id] || {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  };

  if (extraType !== "wide") {
    batterStat.balls += 1; // legal balls faced or no-balls count towards batter balls faced
  }

  let milestone: "fifty" | "century" | "wicket" | "match_won" | "innings_break" | undefined;

  if (runsOffBat > 0 && (extraType === "none" || extraType === "no_ball")) {
    const prevRuns = batterStat.runs;
    batterStat.runs += runsOffBat;
    if (runsOffBat === 4) batterStat.fours += 1;
    if (runsOffBat === 6) batterStat.sixes += 1;

    if (prevRuns < 50 && batterStat.runs >= 50) milestone = "fifty";
    if (prevRuns < 100 && batterStat.runs >= 100) milestone = "century";
  }
  inn.batterStats[striker.id] = batterStat;

  // Update Bowler Stats
  const bowlerStat = inn.bowlerStats[bowler.id] || {
    overs: 0,
    ballsBowled: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
    dotBalls: 0,
  };

  // Runs charged to bowler (excludes Byes and Leg Byes)
  let bowlerRunsCharged = runsOffBat;
  if (extraType === "wide") {
    bowlerRunsCharged = 1 + extraRuns;
    bowlerStat.wides += 1 + extraRuns;
  } else if (extraType === "no_ball") {
    bowlerRunsCharged = 1 + runsOffBat;
    bowlerStat.noBalls += 1;
  }

  bowlerStat.runsConceded += bowlerRunsCharged;
  if (isLegal) {
    bowlerStat.ballsBowled += 1;
    bowlerStat.overs = Math.floor(bowlerStat.ballsBowled / 6) + (bowlerStat.ballsBowled % 6) / 10;
    if (totalRunsThisBall === 0 && !isWicket) {
      bowlerStat.dotBalls += 1;
    }
  }

  // Wicket logic
  let dismissalText = "";
  if (isWicket && dismissalType) {
    milestone = "wicket";
    inn.wickets += 1;

    const victimId = outPlayerId || striker.id;
    const victim = battingTeam.players.find((p) => p.id === victimId);
    const victimStat = inn.batterStats[victimId] || batterStat;
    victimStat.isOut = true;

    const currentOverStr = `${Math.floor((inn.balls - (isLegal ? 1 : 0)) / 6)}.${(inn.balls - (isLegal ? 1 : 0)) % 6}`;

    // Credit bowler if dismissal is bowler-credited
    const bowlerCredited = ["bowled", "caught", "lbw", "stumped", "hit_wicket"].includes(dismissalType);
    if (bowlerCredited) {
      bowlerStat.wickets += 1;
    }

    // Dismissal string
    const fielder = fielderId ? bowlingTeam.players.find((p) => p.id === fielderId) : null;
    if (dismissalType === "bowled") dismissalText = `b ${bowler.name}`;
    else if (dismissalType === "caught") dismissalText = fielder ? `c ${fielder.name} b ${bowler.name}` : `c & b ${bowler.name}`;
    else if (dismissalType === "lbw") dismissalText = `lbw b ${bowler.name}`;
    else if (dismissalType === "stumped") dismissalText = `st ${fielder?.name || "wk"} b ${bowler.name}`;
    else if (dismissalType === "run_out") dismissalText = `run out (${fielder?.name || "sub"})`;
    else if (dismissalType === "hit_wicket") dismissalText = `hit wicket b ${bowler.name}`;
    else dismissalText = dismissalType;

    victimStat.dismissal = {
      type: dismissalType,
      bowlerId: bowlerCredited ? bowler.id : undefined,
      fielderId,
      text: dismissalText,
      over: Math.floor(inn.balls / 6),
      ball: inn.balls % 6,
    };
    inn.batterStats[victimId] = victimStat;

    // Fall of Wickets
    const fow: FallOfWicket = {
      wicketNumber: inn.wickets,
      score: inn.runs,
      overs: currentOverStr,
      playerId: victimId,
      playerRuns: victimStat.runs,
      playerBalls: victimStat.balls,
    };
    inn.fallOfWickets.push(fow);
  }

  inn.bowlerStats[bowler.id] = bowlerStat;

  // Ball record for commentary and timeline
  const overNumber = Math.floor((inn.balls - (isLegal ? 1 : 0)) / 6);
  const ballInOver = isLegal ? ((inn.balls - 1) % 6) + 1 : (inn.balls % 6);

  const commentary = generateCommentary({
    bowlerName: bowler.name,
    batsmanName: striker.name,
    runsOffBat,
    extraType,
    extraRuns,
    totalRuns: totalRunsThisBall,
    isWicket,
    dismissalType,
    fielderName: fielderId ? bowlingTeam.players.find((p) => p.id === fielderId)?.name : undefined,
    shotZone,
    batterTotalRuns: batterStat.runs,
    isMilestone: milestone === "fifty" || milestone === "century" ? milestone : null,
    target: inn.target,
    runsNeeded: inn.target ? Math.max(0, inn.target - inn.runs) : undefined,
    ballsRemaining: match.settings.maxOvers * match.settings.ballsPerOver - inn.balls,
  });

  const ballRecord: BallRecord = {
    id: `ball_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ballNumber: inn.ballHistory.length + 1,
    overNumber,
    ballInOver,
    isLegal,
    strikerId: inn.strikerId,
    nonStrikerId: inn.nonStrikerId,
    bowlerId: inn.currentBowlerId,
    runsOffBat,
    extraType,
    extraRuns,
    totalRuns: totalRunsThisBall,
    isWicket,
    dismissal: isWicket && dismissalType ? {
      type: dismissalType,
      outPlayerId: outPlayerId || striker.id,
      bowlerId: bowler.id,
      fielderId,
      text: dismissalText,
    } : undefined,
    shotZone,
    shotCoordinates,
    commentary,
    timestamp: Date.now(),
    cumulativeScore: inn.runs,
    cumulativeWickets: inn.wickets,
  };

  inn.ballHistory.push(ballRecord);

  // Rotate strike based on runs scored
  // Odd runs rotate strike (1, 3, 5, or odd extras)
  let effectiveRunningRuns = runsOffBat;
  if (extraType === "bye" || extraType === "leg_bye") {
    effectiveRunningRuns = extraRuns;
  } else if (extraType === "wide" || extraType === "no_ball") {
    effectiveRunningRuns = extraRuns + (extraType === "no_ball" ? runsOffBat : 0);
  }

  const shouldSwapStrike = effectiveRunningRuns % 2 === 1;
  if (shouldSwapStrike) {
    const temp = inn.strikerId;
    inn.strikerId = inn.nonStrikerId;
    inn.nonStrikerId = temp;
  }

  // If wicket fell and batsman was replaced immediately via input
  if (isWicket) {
    const victimId = outPlayerId || striker.id;
    if (input.newBatsmanId) {
      if (victimId === inn.strikerId) {
        inn.strikerId = input.newBatsmanId;
      } else {
        inn.nonStrikerId = input.newBatsmanId;
      }
      inn.dnbPlayerIds = inn.dnbPlayerIds.filter((id) => id !== input.newBatsmanId);
    }
  }

  // End of Over check
  let needsNewBowler = false;
  if (isLegal && inn.balls % match.settings.ballsPerOver === 0) {
    // End of over: swap striker & non-striker
    const temp = inn.strikerId;
    inn.strikerId = inn.nonStrikerId;
    inn.nonStrikerId = temp;

    inn.previousBowlerId = inn.currentBowlerId;
    needsNewBowler = true;
  }

  // Match / Innings completion conditions
  const maxBalls = match.settings.maxOvers * match.settings.ballsPerOver;
  const maxWickets = battingTeam.players.length - 1; // standard cricket 10 wickets for 11 players

  // 2nd Innings Target reached?
  if (innIndex === 1 && inn.target && inn.runs >= inn.target) {
    inn.isCompleted = true;
    match.status = "completed";
    milestone = "match_won";
    const wicketsLeft = maxWickets - inn.wickets;
    const ballsRemaining = maxBalls - inn.balls;
    match.result = {
      winnerTeamId: battingTeam.id,
      margin: `by ${wicketsLeft} wicket${wicketsLeft > 1 ? "s" : ""}`,
      summary: `${battingTeam.name} won by ${wicketsLeft} wicket${wicketsLeft > 1 ? "s" : ""} (${ballsRemaining} balls remaining)`,
    };
    return { match, milestoneReached: milestone, eventNotification: match.result.summary };
  }

  // Innings finished (all out or balls completed)
  const isAllOut = inn.wickets >= maxWickets;
  const isBallsCompleted = inn.balls >= maxBalls;

  if (isAllOut || isBallsCompleted) {
    inn.isCompleted = true;

    if (innIndex === 0) {
      // 1st innings ended
      match.status = "innings_break";
      milestone = "innings_break";
      const target = inn.runs + 1;
      match.innings[1].target = target;
      return {
        match,
        milestoneReached: milestone,
        eventNotification: `1st Innings Completed: ${battingTeam.shortName} scored ${inn.runs}/${inn.wickets}. Target is ${target}!`,
      };
    } else {
      // 2nd innings ended
      match.status = "completed";
      milestone = "match_won";
      const target = inn.target || 0;
      if (inn.runs === target - 1) {
        match.result = {
          winnerTeamId: "tie",
          margin: "Match Tied",
          summary: `Match Tied! Both teams scored ${inn.runs} runs!`,
        };
      } else {
        const runsMargin = target - 1 - inn.runs;
        match.result = {
          winnerTeamId: bowlingTeam.id,
          margin: `by ${runsMargin} run${runsMargin > 1 ? "s" : ""}`,
          summary: `${bowlingTeam.name} won by ${runsMargin} run${runsMargin > 1 ? "s" : ""}`,
        };
      }
      return { match, milestoneReached: milestone, eventNotification: match.result.summary };
    }
  }

  const needsNewBatsman = isWicket && !input.newBatsmanId && inn.wickets < maxWickets;

  return {
    match,
    milestoneReached: milestone,
    needsNewBowler: needsNewBowler && !isBallsCompleted,
    needsNewBatsman,
    eventNotification: ballRecord.commentary,
  };
}

export function swapStriker(currentMatch: Match): Match {
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  const inn = match.innings[match.currentInningsIndex];
  const temp = inn.strikerId;
  inn.strikerId = inn.nonStrikerId;
  inn.nonStrikerId = temp;
  return match;
}

export function changeBowler(currentMatch: Match, newBowlerId: string): Match {
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  const inn = match.innings[match.currentInningsIndex];
  inn.currentBowlerId = newBowlerId;
  return match;
}

export function setNewBatsman(currentMatch: Match, outPlayerId: string, newBatsmanId: string): Match {
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  const inn = match.innings[match.currentInningsIndex];

  if (inn.strikerId === outPlayerId) {
    inn.strikerId = newBatsmanId;
  } else if (inn.nonStrikerId === outPlayerId) {
    inn.nonStrikerId = newBatsmanId;
  }
  inn.dnbPlayerIds = inn.dnbPlayerIds.filter((id) => id !== newBatsmanId);
  return match;
}

export function startSecondInnings(
  currentMatch: Match,
  strikerId: string,
  nonStrikerId: string,
  openingBowlerId: string
): Match {
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  match.status = "innings_2";
  match.currentInningsIndex = 1;

  const inn2 = match.innings[1];
  inn2.strikerId = strikerId;
  inn2.nonStrikerId = nonStrikerId;
  inn2.currentBowlerId = openingBowlerId;
  inn2.dnbPlayerIds = inn2.dnbPlayerIds.filter((id) => id !== strikerId && id !== nonStrikerId);

  return match;
}

export function undoLastBall(currentMatch: Match): Match {
  const match: Match = JSON.parse(JSON.stringify(currentMatch));
  const inn = match.innings[match.currentInningsIndex];

  if (inn.ballHistory.length === 0) return match;

  const lastBall = inn.ballHistory.pop();
  if (!lastBall) return match;

  // Restore runs
  inn.runs -= lastBall.totalRuns;

  // Restore legal balls
  if (lastBall.isLegal) {
    inn.balls = Math.max(0, inn.balls - 1);
  }

  // Restore extras
  if (lastBall.extraType === "wide") {
    inn.extras.wides = Math.max(0, inn.extras.wides - (1 + lastBall.extraRuns));
    inn.extras.total = Math.max(0, inn.extras.total - (1 + lastBall.extraRuns));
  } else if (lastBall.extraType === "no_ball") {
    inn.extras.noBalls = Math.max(0, inn.extras.noBalls - 1);
    inn.extras.total = Math.max(0, inn.extras.total - 1);
  } else if (lastBall.extraType === "bye") {
    inn.extras.byes = Math.max(0, inn.extras.byes - lastBall.extraRuns);
    inn.extras.total = Math.max(0, inn.extras.total - lastBall.extraRuns);
  } else if (lastBall.extraType === "leg_bye") {
    inn.extras.legByes = Math.max(0, inn.extras.legByes - lastBall.extraRuns);
    inn.extras.total = Math.max(0, inn.extras.total - lastBall.extraRuns);
  }

  // Restore batter
  const bStat = inn.batterStats[lastBall.strikerId];
  if (bStat) {
    if (lastBall.extraType !== "wide") {
      bStat.balls = Math.max(0, bStat.balls - 1);
    }
    if (lastBall.runsOffBat > 0 && (lastBall.extraType === "none" || lastBall.extraType === "no_ball")) {
      bStat.runs = Math.max(0, bStat.runs - lastBall.runsOffBat);
      if (lastBall.runsOffBat === 4) bStat.fours = Math.max(0, bStat.fours - 1);
      if (lastBall.runsOffBat === 6) bStat.sixes = Math.max(0, bStat.sixes - 1);
    }
  }

  // Restore bowler
  const bowStat = inn.bowlerStats[lastBall.bowlerId];
  if (bowStat) {
    let bowRuns = lastBall.runsOffBat;
    if (lastBall.extraType === "wide") bowRuns = 1 + lastBall.extraRuns;
    if (lastBall.extraType === "no_ball") bowRuns = 1 + lastBall.runsOffBat;

    bowStat.runsConceded = Math.max(0, bowStat.runsConceded - bowRuns);
    if (lastBall.isLegal) {
      bowStat.ballsBowled = Math.max(0, bowStat.ballsBowled - 1);
      bowStat.overs = Math.floor(bowStat.ballsBowled / 6) + (bowStat.ballsBowled % 6) / 10;
    }
    if (lastBall.extraType === "wide") bowStat.wides = Math.max(0, bowStat.wides - (1 + lastBall.extraRuns));
    if (lastBall.extraType === "no_ball") bowStat.noBalls = Math.max(0, bowStat.noBalls - 1);
  }

  // Restore Wicket if applicable
  if (lastBall.isWicket && lastBall.dismissal) {
    inn.wickets = Math.max(0, inn.wickets - 1);
    const victimStat = inn.batterStats[lastBall.dismissal.outPlayerId];
    if (victimStat) {
      victimStat.isOut = false;
      delete victimStat.dismissal;
    }
    inn.fallOfWickets.pop();
    if (bowStat && ["bowled", "caught", "lbw", "stumped", "hit_wicket"].includes(lastBall.dismissal.type)) {
      bowStat.wickets = Math.max(0, bowStat.wickets - 1);
    }
  }

  // Restore striker and non-striker positions
  inn.strikerId = lastBall.strikerId;
  inn.nonStrikerId = lastBall.nonStrikerId;
  inn.currentBowlerId = lastBall.bowlerId;

  // Revert completed match status if needed
  if (match.status === "completed" || match.status === "innings_break") {
    match.status = match.currentInningsIndex === 0 ? "innings_1" : "innings_2";
    delete match.result;
    inn.isCompleted = false;
  }

  return match;
}
