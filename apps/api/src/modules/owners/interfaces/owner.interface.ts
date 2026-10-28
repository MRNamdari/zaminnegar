import type { IParcel } from '../../parcels/interfaces/parcel.interface';

/** A person or organization with a share in a parcel. */
export interface IOwner {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  parcels?: IParcelOwner[];
}

export interface IParcelOwner {
  parcelId: string;
  ownerId: string;
  share: number;
  createdAt: Date;
  updatedAt: Date;
  parcel?: IParcel;
  owner?: IOwner;
}

export type ICreateOwner = Pick<IOwner, 'name'> & Partial<Pick<IOwner, 'phone' | 'email' | 'notes'>>;
export type ICreateParcelOwner = Pick<IParcelOwner, 'parcelId' | 'ownerId' | 'share'>;
