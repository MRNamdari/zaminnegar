/** `[longitude, latitude]` in WGS 84 (GeoJSON order). */
export type Position = [longitude: number, latitude: number];

/** A GeoJSON MultiPolygon: polygons → rings → positions. Rings are closed (first == last). */
export interface IMultiPolygon {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

/** `[west, south, east, north]` in degrees. */
export type BoundingBox = [west: number, south: number, east: number, north: number];
