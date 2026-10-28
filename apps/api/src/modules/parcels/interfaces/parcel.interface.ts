import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IBlock } from '../../blocks/interfaces/block.interface';
import type { IParcelOwner } from '../../owners/interfaces/owner.interface';
import type { IProject } from '../../projects/interfaces/project.interface';

/** One agricultural land parcel. */
export interface IParcel {
  id: string;
  projectId: string;
  blockId?: string | null;
  name: string;
  /** Boundary in WGS 84 (EPSG:4326), `[longitude, latitude]`. */
  geometry: IMultiPolygon;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  notes: string | null;
  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  block?: IBlock;
  owners?: IParcelOwner[];
}

/** Fields a caller may provide when creating a parcel. */
export type ICreateParcel = Pick<IParcel, 'projectId' | 'name' | 'geometry'> &
  Partial<Pick<IParcel, 'blockId' | 'fillColor' | 'fillOpacity' | 'strokeColor' | 'strokeWidth' | 'notes'>>;

/** Fields that can be changed after creation. */
export type IParcelPatch = Partial<
  Pick<IParcel, 'name' | 'geometry' | 'fillColor' | 'fillOpacity' | 'strokeColor' | 'strokeWidth' | 'notes'>
>;
