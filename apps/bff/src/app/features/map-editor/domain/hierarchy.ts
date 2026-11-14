import type { AreaFeature, Level, PolygonGeometry } from "../core/schemas";
import { centroid, pointInRing } from "./geometry";

/**
 * Suggests a parent feature: the first feature of an allowed parent level (in the
 * configured order) whose outer ring contains the new geometry's centroid.
 */
export function findParentId(
  level: Level,
  geometry: PolygonGeometry,
  candidates: readonly AreaFeature[],
  hierarchy: Readonly<Partial<Record<Level, readonly Level[]>>>,
): string | null {
  const ring = geometry.coordinates[0];
  if (!ring) return null;
  const center = centroid(ring);
  for (const parentLevel of hierarchy[level] ?? []) {
    const parent = candidates.find(
      (f) => f.properties.level === parentLevel && pointInRing(center, f.geometry.coordinates[0] ?? []),
    );
    if (parent) return parent.id;
  }
  return null;
}
