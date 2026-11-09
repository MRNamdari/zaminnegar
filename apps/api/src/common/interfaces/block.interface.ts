import type { BlockStatus } from '../enums/block-status.enum';
import type { IBoundary } from './boundary.interface';
import type { IParcel } from './parcel.interface';
import type { IProject } from './project.interface';
import type { IRegion } from './region.interface';

/** A block belongs to a single region and groups parcels. */
export interface IBlock {
  id: string;
  projectId: string;
  regionId: string;
  boundaryId: string;
  name: string;
  description: string;
  status: BlockStatus;
  areaM2?: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  region?: IRegion;
  boundary?: IBoundary;
  parcels?: IParcel[];
}
