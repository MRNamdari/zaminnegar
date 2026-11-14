import type { IBlock } from './block.interface';
import type { IBoundary } from './boundary.interface';
import type { IOwner } from './owner.interface';
import type { IParcel } from './parcel.interface';
import type { IRegion } from './region.interface';

export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  boundaries?: IBoundary[];
  regions?: IRegion[];
  blocks?: IBlock[];
  parcels?: IParcel[];
  owners?: IOwner[];
}
