const SCALE = 10_000; // share_pct has 4 decimals

const toUnits = (pct: number): number => Math.round(pct * SCALE);

/** True when `current + incoming` is more than 100 %, compared in whole 1/10000 % units. */
export function exceedsFullOwnership(current: number, incoming: number): boolean {
  return toUnits(current) + toUnits(incoming) > 100 * SCALE;
}

/** What is left of the 100 % after `current`, never negative. */
export function remainingShare(current: number): number {
  return Math.max(0, (100 * SCALE - toUnits(current)) / SCALE);
}
