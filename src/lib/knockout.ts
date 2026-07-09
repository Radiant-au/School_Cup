import type { Match } from "@/data/tournament";

export function isKnockoutGroup(group: string): boolean {
  return (
    group === "Semi-final" || group === "Final" || group === "Bronze Final"
  );
}

export interface KnockoutOutcome {
  isKnockout: boolean;
  hasPenalties: boolean;
  aWon: boolean;
  bWon: boolean;
  aEliminated: boolean;
  bEliminated: boolean;
  penAWins: boolean;
  penBWins: boolean;
}

/**
 * Derive the winner of a knockout tie. A finished knockout match (Semi-final /
 * Final / Bronze Final) is decided by `scoreA`/`scoreB`; if those are level, the
 * `penaltyA`/`penaltyB` shootout snapshot breaks the tie. Penalty shootout
 * display is gated on knockout + finished + level scores — a finished
 * group-stage match (or a knockout won in regular time) never has penalties.
 * Non-knockout or unfinished matches resolve to no winner. The eliminated side
 * is the loser of a finished knockout tie.
 */
export function deriveKnockoutOutcome(match: Match): KnockoutOutcome {
  const isFinished =
    match.finished && match.scoreA !== null && match.scoreB !== null;
  const isKnockout = isKnockoutGroup(match.group);
  const isLevel = isFinished && match.scoreA === match.scoreB;
  const hasPenalties =
    isKnockout &&
    isLevel &&
    match.penaltyA != null &&
    match.penaltyB != null;

  let aWon = false;
  let bWon = false;
  if (isFinished && isKnockout) {
    const sA = match.scoreA as number;
    const sB = match.scoreB as number;
    if (sA > sB) aWon = true;
    else if (sB > sA) bWon = true;
    else if (hasPenalties) {
      if ((match.penaltyA as number) > (match.penaltyB as number)) aWon = true;
      else if ((match.penaltyB as number) > (match.penaltyA as number))
        bWon = true;
    }
  }

  return {
    isKnockout,
    hasPenalties,
    aWon,
    bWon,
    aEliminated: bWon,
    bEliminated: aWon,
    penAWins: hasPenalties && aWon,
    penBWins: hasPenalties && bWon,
  };
}
