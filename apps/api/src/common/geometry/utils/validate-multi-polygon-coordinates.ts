import { MAX_GEOMETRY_VERTICES } from '../geometry.constants';

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function validatePosition(position: unknown): string | null {
  if (!Array.isArray(position) || position.length !== 2 || !position.every(isFiniteNumber)) {
    return 'every position must be a [longitude, latitude] pair of numbers';
  }
  const [lon, lat] = position as [number, number];
  if (lon < -180 || lon > 180) return 'longitude must be within [-180, 180]';
  if (lat < -90 || lat > 90) return 'latitude must be within [-90, 90]';
  return null;
}

function validateRing(ring: unknown): string | null {
  if (!Array.isArray(ring) || ring.length < 4) return 'a ring needs at least 4 positions';
  for (const position of ring) {
    const error = validatePosition(position);
    if (error) return error;
  }
  const first = ring[0] as [number, number];
  const last = ring[ring.length - 1] as [number, number];
  return first[0] === last[0] && first[1] === last[1] ? null : 'a ring must be closed (first position equals last)';
}

/**
 * Structural validation of MultiPolygon coordinates (shape, ranges, closed rings,
 * vertex budget). Topological validity (self-intersection) is checked by PostGIS.
 *
 * @returns An error message, or `null` when the coordinates are well-formed.
 */
export function validateMultiPolygonCoordinates(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return 'coordinates must be a non-empty array of polygons';
  let vertices = 0;
  for (const polygon of value) {
    if (!Array.isArray(polygon) || polygon.length === 0) return 'every polygon needs at least one ring';
    for (const ring of polygon) {
      const error = validateRing(ring);
      if (error) return error;
      vertices += (ring as unknown[]).length;
    }
  }
  return vertices > MAX_GEOMETRY_VERTICES ? `geometry exceeds ${MAX_GEOMETRY_VERTICES} vertices` : null;
}
