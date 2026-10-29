import { DismissalType, ExtraType, ShotZone } from "@/types/cricket";

interface CommentaryParams {
  bowlerName: string;
  batsmanName: string;
  runsOffBat: number;
  extraType: ExtraType;
  extraRuns: number;
  totalRuns: number;
  isWicket: boolean;
  dismissalType?: DismissalType;
  fielderName?: string;
  shotZone?: ShotZone;
  batterTotalRuns?: number;
  isMilestone?: "fifty" | "century" | null;
  target?: number;
  runsNeeded?: number;
  ballsRemaining?: number;
}

const zoneNames: Record<ShotZone, string> = {
  cover: "through the covers",
  point: "past backward point",
  third_man: "down to third man",
  fine_leg: "towards fine leg",
  square_leg: "through square leg",
  mid_wicket: "into the mid-wicket gap",
  long_on: "down to long-on",
  long_off: "high over long-off",
  straight: "straight down the ground",
};

export function generateCommentary(p: CommentaryParams): string {
  const {
    bowlerName,
    batsmanName,
    runsOffBat,
    extraType,
    extraRuns,
    isWicket,
    dismissalType,
    fielderName,
    shotZone,
    batterTotalRuns,
    isMilestone,
    runsNeeded,
    ballsRemaining,
  } = p;

  const zoneText = shotZone ? ` ${zoneNames[shotZone]}` : "";

  // Wickets
  if (isWicket) {
    switch (dismissalType) {
      case "bowled":
        return `OUT! CLEAN BOWLED! ${bowlerName} hits the timber! The ball beats ${batsmanName}'s defense and sends the off-stump cartwheeling! Huge breakthrough!`;
      case "caught":
        return `OUT! CAUGHT! ${bowlerName} strikes! ${batsmanName} tries to go big${zoneText}, but mistimes it straight into the safe hands of ${fielderName || "the fielder"}! Gone!`;
      case "lbw":
        return `OUT! L.B.W.! Loud appeal from ${bowlerName} and the finger goes up! Plumb in front of the middle stump. ${batsmanName} has to walk back!`;
      case "run_out":
        return `OUT! RUN OUT! Chaos in the middle! Direct hit by ${fielderName || "the fielder"}! ${batsmanName} is caught well short of the crease. What a disastrous mix-up!`;
      case "stumped":
        return `OUT! STUMPED! ${batsmanName} skips down the track, gets completely beaten by the spin of ${bowlerName}, and the wicketkeeper whips off the bails in a flash!`;
      case "hit_wicket":
        return `OUT! HIT WICKET! Oh dear! ${batsmanName} goes too deep in the crease and knocks the bails off with the bat! Unbelievable way to get out!`;
      default:
        return `OUT! ${batsmanName} is dismissed! Great execution by ${bowlerName}!`;
    }
  }

  // Extras
  if (extraType === "wide") {
    if (extraRuns > 0) {
      return `WIDE + ${extraRuns}! ${bowlerName} sprays it way down the leg side, and the keeper can't collect cleanly! Bonus runs for the batting side!`;
    }
    return `WIDE! ${bowlerName} strays outside the tramlines. Umpire signals wide. Free run added to the total.`;
  }

  if (extraType === "no_ball") {
    return `NO BALL! ${bowlerName} oversteps the bowling crease! Free hit coming up on the next delivery! Batter can swing freely now!`;
  }

  if (extraType === "bye" || extraType === "leg_bye") {
    const type = extraType === "bye" ? "Byes" : "Leg byes";
    return `${extraRuns} ${type}! Ball skids through pads as batsmen scamper through for a brisk run.`;
  }

  // Sixes
  if (runsOffBat === 6) {
    const sixPhrases = [
      `SIX! THAT IS COLOSSAL! ${batsmanName} clears the front leg and dispatches ${bowlerName}${zoneText} miles into the stands! What a monstrous strike!`,
      `SIX! MAXIMUM! Clean as a whistle! ${batsmanName} reads the length early and deposits ${bowlerName} over the ropes${zoneText}! Pure authority!`,
      `SIX! HIGH, HANDSOME AND GONE! ${batsmanName} rocks back and lofts ${bowlerName} effortlessly into the crowd! What an exhibition of power hitting!`,
      `SIX! SMOKED INTO ORBIT! ${batsmanName} connects sweet as a nut! The ball sails into the top tier! Outstanding stroke!`,
    ];
    let base = sixPhrases[Math.floor(Math.random() * sixPhrases.length)];
    if (isMilestone === "fifty") base += ` That also brings up a magnificent FIFTY for ${batsmanName}!`;
    if (isMilestone === "century") base += ` AND THAT IS A SENSATIONAL CENTURY! Take a bow, ${batsmanName}!`;
    return base;
  }

  // Fours
  if (runsOffBat === 4) {
    const fourPhrases = [
      `FOUR! CRACKED AWAY! ${batsmanName} finds the gap beautifully${zoneText}! The ball races across the lush outfield to the boundary!`,
      `FOUR! PURE TIMING! ${bowlerName} overpitches and ${batsmanName} punches it${zoneText} with elegance and balance! Superb stroke!`,
      `FOUR! SWEET AS HONEY! ${batsmanName} opens the face of the blade and guides it exquisitely${zoneText}! No chance for the sweeper!`,
      `FOUR! POWERFUL SHOT! Short and punished! ${batsmanName} pulls it emphatically${zoneText}! That was begging to be hit!`,
    ];
    let base = fourPhrases[Math.floor(Math.random() * fourPhrases.length)];
    if (isMilestone === "fifty") base += ` And that boundary brings up a well-deserved HALF-CENTURY for ${batsmanName}!`;
    if (isMilestone === "century") base += ` MAGNIFICENT HUNDRED! ${batsmanName} raises the bat to thunderous applause!`;
    return base;
  }

  // 3 runs
  if (runsOffBat === 3) {
    return `3 runs! Superb running between the wickets! ${batsmanName} pierces the gap${zoneText}, and they hustle hard to convert two into three!`;
  }

  // 2 runs
  if (runsOffBat === 2) {
    return `2 runs. Soft hands from ${batsmanName}${zoneText}, calls early and completes the double comfortably before the throw comes in.`;
  }

  // 1 run
  if (runsOffBat === 1) {
    const singlePhrases = [
      `1 run. ${batsmanName} nudges it${zoneText} and trots through to rotate the strike. Good sensible batting.`,
      `1 run. Dabbed with soft hands towards the infield for a quick single. Good communication between the pair.`,
      `1 run. Pushed gently off the back foot${zoneText} for an easy single. Keeps the scoreboard ticking.`,
    ];
    let base = singlePhrases[Math.floor(Math.random() * singlePhrases.length)];
    if (isMilestone === "fifty") base += ` And with that single, ${batsmanName} reaches a crucial 50!`;
    return base;
  }

  // Dot ball
  const dotPhrases = [
    `No run. Excellent delivery from ${bowlerName}! Right on the money, leaving ${batsmanName} no room to free the arms.`,
    `No run. ${bowlerName} hits a hard good length on fourth stump. ${batsmanName} defends solidly towards cover.`,
    `No run. Beaten outside off! Sharp deviation off the seam. ${batsmanName} has a feel for it but withdraws the bat just in time.`,
    `No run. Pushed back down the pitch. ${bowlerName} intercepts on the follow-through. Dot ball.`,
  ];
  return dotPhrases[Math.floor(Math.random() * dotPhrases.length)];
}
