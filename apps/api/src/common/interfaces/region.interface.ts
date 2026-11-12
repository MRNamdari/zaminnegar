import type { RegionStatus } from '../enums/region-status.enum';
import type { IBlock } from './block.interface';
import type { IBoundary } from './boundary.interface';
import type { IParcel } from './parcel.interface';
import type { IProject } from './project.interface';

/** A region defines a geographic territory and the blocks within it. */
export interface IRegion {
  id: string;
  projectId: string;
  boundaryId: string;
  name: string;
  description: string;
  status: RegionStatus;
  areaM2: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  boundary?: IBoundary;
  blocks?: IBlock[];
  parcels?: IParcel[];
  /** Only present in list results. */
  blocksCount?: number;
  /** Only present in list results. */
  parcelsCount?: number;
}
