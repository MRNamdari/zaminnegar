import { IBlock } from '../../blocks/interfaces/block.interface';
import { IFeature } from '../../features/interfaces/feature.interface';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';
import { IRegion } from '../../regions/interfaces/region.interface';

/** A project groups the parcels of one farm or survey. */
export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  features?: IFeature[];
  regions?: IRegion[];
  blocks?: IBlock[];
  parcels?: IParcel[];
}

/** Fields a caller may provide when creating a project. */
export type ICreateProject = Pick<IProject, 'name' | 'description'>;
