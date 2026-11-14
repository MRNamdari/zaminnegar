import type { IBlock } from './block.interface';
import type { IMultiPolygon } from './geometry.interface';
import type { IParcel } from './parcel.interface';
import type { IProject } from './project.interface';
import type { IRegion } from './region.interface';

/** The polygon outline of a region, block or parcel. */
export interface IBoundary {
  id: string;
  projectId: string;
  name: string;
  /** Outline in WGS 84 (EPSG:4326), `[longitude, latitude]`. */
  geometry: IMultiPolygon;
  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  ofRegion?: IRegion;
  ofBlock?: IBlock;
  ofParcel?: IParcel;
}
