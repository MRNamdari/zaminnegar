import { IParcel } from "../parcels/interface";

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