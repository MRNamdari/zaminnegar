import type { IOwner } from './owner.interface';
import type { IParcel } from './parcel.interface';

/** An owner's share in a parcel. Shares of one parcel sum to at most 100. */
export interface IParcelOwnership {
  parcelId: string;
  ownerId: string;
  /** Percentage of the parcel owned (greater than 0, at most 100). */
  sharePct: number;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  parcel?: IParcel;
  owner?: IOwner;
}
