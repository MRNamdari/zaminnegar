import type { IMultiPolygon } from '@/common/interfaces/geometry.interface';
import type { MapPolygon } from '../dto/map-polygon';

/** The region, block and parcel commands take a MultiPolygon; a Polygon is one with a single part. */
export const toMultiPolygon = (polygon: MapPolygon): IMultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: [polygon.coordinates],
});
