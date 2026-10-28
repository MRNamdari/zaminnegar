import type { IRegion } from '../../regions/interfaces/region.interface';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';

/** A block belongs to a single region and groups parcels. */
export interface IBlock {
  id: string;
  regionId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  region?: IRegion;
  parcels?: IParcel[];
}

/** Fields a caller may provide when creating a block. */
export type ICreateBlock = Pick<IBlock, 'regionId' | 'name' | 'description'>;
