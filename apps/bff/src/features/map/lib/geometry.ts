import bbox from '@turf/bbox';
import { polygon } from '@turf/helpers';
import kinks from '@turf/kinks';
import type { MultiPolygonDto } from '@zaminnegar/api-client';
import type { MultiPolygon } from 'geojson';
import type { Bounds, Position } from '../types';
import type { GeometryIssue } from './geometry-issue';

/**
 * Polygons → rings → positions WITHOUT the repeated closing vertex.
 * This is the shape the editor works with; {@link toMultiPolygon} closes the rings again for the API.
 */
export type OpenRings = Position[][][];

/** Location of one vertex inside {@link OpenRings}. */
export interface VertexPath {
  polygon: number;
  ring: number;
  index: number;
}

/** API geometry → editable rings (drops each ring's closing vertex). */
export function toOpenRings(geometry: MultiPolygonDto): OpenRings {
  return geometry.coordinates.map((poly) =>
    poly.map((ring) => ring.slice(0, -1).map(([longitude, latitude]): Position => [longitude, latitude])),
  );
}

/** Editable rings → API geometry (closes every ring). */
export function toMultiPolygon(rings: OpenRings): MultiPolygonDto {
  return { type: 'MultiPolygon', coordinates: rings.map((poly) => poly.map((ring) => [...ring, ring[0]])) };
}

/** Validates one open ring: enough vertices, no repeated neighbours, no self-intersection. */
export function validateRing(ring: Position[]): GeometryIssue | null {
  if (ring.length < 3) return 'TOO_FEW_VERTICES';
  const hasDuplicate = ring.some(([lon, lat], i) => {
    const [nextLon, nextLat] = ring[(i + 1) % ring.length];
    return lon === nextLon && lat === nextLat;
  });
  if (hasDuplicate) return 'DUPLICATE_VERTEX';
  return kinks(polygon([[...ring, ring[0]]])).features.length > 0 ? 'SELF_INTERSECTION' : null;
}

/** Validates every ring; returns the first problem found. */
export function validateOpenRings(rings: OpenRings): GeometryIssue | null {
  for (const poly of rings) {
    for (const ring of poly) {
      const issue = validateRing(ring);
      if (issue) return issue;
    }
  }
  return null;
}

/** Bounding box `[west, south, east, north]` of a geometry. */
export function getBounds(geometry: MultiPolygonDto): Bounds {
  const [west, south, east, north] = bbox(geometry as MultiPolygon);
  return [west, south, east, north];
}

/** `[west, south, east, north]` → the `[[west, south], [east, north]]` form MapLibre's `fitBounds` expects. */
export const toLngLatBounds = ([west, south, east, north]: readonly number[]): [[number, number], [number, number]] => [[west, south], [east, north]];

/** Shared camera options when zooming to a parcel or project. */
export const FIT_BOUNDS_OPTIONS = { padding: 90, maxZoom: 19, duration: 800 } as const;

export const midpoint = (a: Position, b: Position): Position => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** Immutable update helpers for {@link OpenRings}. */
export const replaceVertex = (rings: OpenRings, { polygon: p, ring: r, index }: VertexPath, position: Position): OpenRings =>
  rings.map((poly, pi) => (pi !== p ? poly : poly.map((ring, ri) => (ri !== r ? ring : ring.map((v, vi) => (vi === index ? position : v))))));

export const insertVertexAfter = (rings: OpenRings, { polygon: p, ring: r, index }: VertexPath, position: Position): OpenRings =>
  rings.map((poly, pi) => (pi !== p ? poly : poly.map((ring, ri) => (ri !== r ? ring : [...ring.slice(0, index + 1), position, ...ring.slice(index + 1)]))));

export const removeVertex = (rings: OpenRings, { polygon: p, ring: r, index }: VertexPath): OpenRings =>
  rings.map((poly, pi) => (pi !== p ? poly : poly.map((ring, ri) => (ri !== r ? ring : ring.filter((_, vi) => vi !== index)))));
