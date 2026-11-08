import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IBlock } from '../../blocks/interfaces/block.interface';
import { IFeature } from '../../features/interfaces/feature.interface';
import { IParcel } from '../../parcels/interfaces/parcel.interface';
import { IProject } from '../../projects/interfaces/project.interface';

/** A region defines a geographic territory and the blocks within it. */
export interface IRegion {
  id: string;
  name: string;
  description: string;

  projectId: string;
  project?: IProject;

  featureId: string;
  /** Only present when the relation is explicitly loaded. */
  feature?: IFeature;

  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  blocks?: IBlock[];
  parcels?: IParcel[];
}

/** Fields a caller may provide when creating a region. */
export type ICreateRegion = Pick<IRegion, 'name' | 'description' | 'featureId'>;
