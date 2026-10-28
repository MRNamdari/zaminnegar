import type { BoundingBox } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IRegion } from './region.interface';

/** A region enriched with aggregates computed by PostGIS. */
export interface IRegionWithStats extends Omit<IRegion, 'parcels'> {
  parcelCount: number;
  /** Bounding box of all parcels, or `null` when the project has none. */
  extent: BoundingBox | null;
}
