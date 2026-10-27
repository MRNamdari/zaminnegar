import type { BoundingBox } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IProject } from './project.interface';

/** A project enriched with aggregates computed by PostGIS. */
export interface IProjectWithStats extends Omit<IProject, 'parcels'> {
  parcelCount: number;
  /** Bounding box of all parcels, or `null` when the project has none. */
  extent: BoundingBox | null;
}
