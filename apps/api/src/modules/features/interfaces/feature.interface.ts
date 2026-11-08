import { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import { IBlock } from '../../blocks/interfaces/block.interface';
import { IParcelOwner } from '../../owners/interfaces/owner.interface';
import { IParcel } from '../../parcels/interfaces/parcel.interface';
import { IProject } from '../../projects/interfaces/project.interface';
import { IRegion } from '../../regions/interfaces/region.interface';

export interface IFeature {
  id: string;

  name: string;
  projectId: string;
  /** Boundary in WGS 84 (EPSG:4326), `[longitude, latitude]`. */
  geometry: IMultiPolygon;
  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  region?: IRegion;
  block?: IBlock;
  parcel?: IParcel;
}
