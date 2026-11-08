import type { IRegion } from '../../regions/interfaces/region.interface';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';
import { IProject } from '../../projects/interfaces/project.interface';
import { IFeature } from '../../features/interfaces/feature.interface';

/** A block belongs to a single region and groups parcels. */
export interface IBlock {
  id: string;
  featureId: string;
  projectId: string;
  regionId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  region?: IRegion;
  parcels?: IParcel[];
  feature?: IFeature;
}

/** Fields a caller may provide when creating a block. */
export type ICreateBlock = Pick<IBlock, 'regionId' | 'name' | 'description'>;
