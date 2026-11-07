import { err, ok, type Result } from "neverthrow";
import { validationError, type ValidationError } from "../core/errors";
import type { AreaFeature, PolygonGeometry, Position } from "../core/schemas";

const EARTH_RADIUS_M = 6378137;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** Spherical-excess approximation of a ring's area in square metres. */
export function ringAreaM2(ring: readonly Position[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i];
    const b = ring[i + 1];
    if (!a || !b) continue;
    sum += rad(b[0] - a[0]) * (2 + Math.sin(rad(a[1])) + Math.sin(rad(b[1])));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export const areaHectares = (geometry: PolygonGeometry): number =>
  Math.round((ringAreaM2(geometry.coordinates[0] ?? []) / 10000) * 1000) / 1000;

/** Vertex-average centroid of the outer ring (matches the original implementation). */
export function centroid(ring: readonly Position[]): Position {
  const points = ring.slice(0, -1);
  const count = points.length || 1;
  return [
    points.reduce((sum, p) => sum + p[0], 0) / count,
    points.reduce((sum, p) => sum + p[1], 0) / count,
  ];
}

export function pointInRing([x, y]: Position, ring: readonly Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (!a || !b) continue;
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

const cross = (o: Position, a: Position, b: Position) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

function segmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Proper crossings between non-adjacent edges of a closed ring. O(n²), fine for editor-sized rings. */
export function hasSelfIntersection(ring: readonly Position[]): boolean {
  const edges = ring.length - 1;
  for (let i = 0; i < edges; i++) {
    for (let j = i + 2; j < edges; j++) {
      if (i === 0 && j === edges - 1) continue; // first and last edges share the closing vertex
      const a = ring[i];
      const b = ring[i + 1];
      const c = ring[j];
      const d = ring[j + 1];
      if (a && b && c && d && segmentsIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}

export function sameGeometry(a: PolygonGeometry, b: PolygonGeometry): boolean {
  if (a === b) return true;
  if (a.coordinates.length !== b.coordinates.length) return false;
  return a.coordinates.every((ringA, r) => {
    const ringB = b.coordinates[r];
    return (
      ringB !== undefined &&
      ringA.length === ringB.length &&
      ringA.every((p, i) => p[0] === ringB[i]?.[0] && p[1] === ringB[i]?.[1])
    );
  });
}

export interface GeometryRules {
  minAreaM2: number;
}

/** Validates user-drawn geometry before it is allowed to leave the editor as a request. */
export function validatePolygon(
  geometry: PolygonGeometry,
  rules: GeometryRules,
): Result<PolygonGeometry, ValidationError> {
  for (const [index, ring] of geometry.coordinates.entries()) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
      return err(validationError("unclosed_ring", `Ring ${index} is not closed`, [{ path: `coordinates.${index}`, message: "first and last positions differ" }]));
    }
    if (ring.some(([lng, lat]) => lng < -180 || lng > 180 || lat < -90 || lat > 90)) {
      return err(validationError("invalid_geometry", "Coordinates are outside valid longitude/latitude ranges"));
    }
    if (hasSelfIntersection(ring)) {
      return err(validationError("self_intersection", "Polygon edges must not cross each other"));
    }
  }
  if (ringAreaM2(geometry.coordinates[0] ?? []) < rules.minAreaM2) {
    return err(validationError("area_too_small", `Polygon area is below ${rules.minAreaM2} m²`));
  }
  return ok(geometry);
}

export function boundsOf(features: readonly AreaFeature[]): [number, number, number, number] | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const feature of features) {
    for (const [x, y] of feature.geometry.coordinates[0] ?? []) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return Number.isFinite(minX) ? [minX, minY, maxX, maxY] : null;
}

/** Rounds coordinates, e.g. to remove float noise like 59.690000000000005 before handing geometry to a strict consumer. */
export function roundGeometry(geometry: PolygonGeometry, digits: number): PolygonGeometry {
  const factor = 10 ** digits;
  const round = (n: number) => Math.round(n * factor) / factor;
  return { type: "Polygon", coordinates: geometry.coordinates.map((ring) => ring.map(([x, y]): Position => [round(x), round(y)])) };
}
