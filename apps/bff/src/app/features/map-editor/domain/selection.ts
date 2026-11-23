import type { Level, PolygonGeometry, Position } from "../core/schemas";
import { pointInPolygon, ringAreaM2 } from "./geometry";

/** A feature that may be hit by a click, together with the application layer that owns it. */
export interface HitCandidate {
  readonly id: string;
  /** Owning application layer (`properties.level`), never derived from the rendering engine. */
  readonly level: Level;
  readonly geometry: PolygonGeometry;
}

/**
 * Resolves which feature a click selects.
 *
 * - Only candidates owned by `activeLevel` are considered; features of other layers are
 *   invisible to the hit test no matter how they overlap.
 * - Among overlapping candidates the smallest outer-ring area wins, so a feature nested
 *   inside a larger one stays reachable. Equal areas fall back to the lowest id, which makes
 *   the outcome independent of iteration order.
 *
 * Returns `null` when no active-layer feature contains the point.
 */
export function resolveHit(
  point: Position,
  candidates: Iterable<HitCandidate>,
  activeLevel: Level,
): string | null {
  let best: { id: string; area: number } | null = null;
  for (const candidate of candidates) {
    if (candidate.level !== activeLevel) continue;
    if (!pointInPolygon(point, candidate.geometry)) continue;
    const area = ringAreaM2(candidate.geometry.coordinates[0] ?? []);
    if (
      best === null ||
      area < best.area ||
      (area === best.area && candidate.id < best.id)
    )
      best = { id: candidate.id, area };
  }
  return best?.id ?? null;
}
