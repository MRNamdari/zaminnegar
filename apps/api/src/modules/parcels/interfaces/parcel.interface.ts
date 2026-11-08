import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IBlock } from '../../blocks/interfaces/block.interface';
import { IFeature } from '../../features/interfaces/feature.interface';
import type { IParcelOwner } from '../../owners/interfaces/owner.interface';
import type { IProject } from '../../projects/interfaces/project.interface';
import { IRegion } from '../../regions/interfaces/region.interface';

export enum ParcelStatus {
  active = 'active',
  inactive = 'inactive',
}

/** One agricultural land parcel. */
export interface IParcel {
  id: string;

  featureId: string;
  projectId: string;
  regionId: string;
  blockId?: string | null;
  name: string;
  status: ParcelStatus;

  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  feature?: IFeature;
  region?: IRegion;
  block?: IBlock;
  owners?: IParcelOwner[];
}

/** Fields a caller may provide when creating a parcel. */
export type ICreateParcel = Pick<IParcel, 'projectId' | 'name' | 'featureId'> &
  Partial<Pick<IParcel, 'blockId'>>;

/** Fields that can be changed after creation. */
export type IParcelPatch = Partial<Pick<IParcel, 'name'>>;
