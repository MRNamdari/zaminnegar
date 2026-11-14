import type { ParcelStatus } from '../enums/parcel-status.enum';
import type { IBlock } from './block.interface';
import type { IBoundary } from './boundary.interface';
import type { IParcelOwnership } from './parcel-ownership.interface';
import type { IProject } from './project.interface';
import type { IRegion } from './region.interface';

/** One agricultural land parcel. */
export interface IParcel {
  id: string;
  projectId: string;
  regionId: string;
  blockId?: string | null;
  boundaryId: string;
  name: string;
  status: ParcelStatus;
  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: number;
  /** Percentage of the region's area this parcel occupies (0-100). Computed by PostGIS. */
  regionOccupancyPct: number;
  /** Percentage of the block's area this parcel occupies (0-100). Null when the parcel has no block. */
  blockOccupancyPct?: number | null;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  region?: IRegion;
  block?: IBlock | null;
  boundary?: IBoundary;
  ownerships?: IParcelOwnership[];
  /** Only present in list results. */
  ownershipsCount?: number;
}
