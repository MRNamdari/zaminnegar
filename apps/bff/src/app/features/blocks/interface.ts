import { IParcel } from "../parcels/interface";
import { IRegion } from "../regions/interface";
import { IMultiPolygon } from "../parcels/interface";

export interface IBlock {
  id: string;
  regionId: string;
  name: string;
  description: string;
  territory: IMultiPolygon;
  areaM2: string;
  createdAt: Date;
  updatedAt: Date;
  region?: IRegion;
  parcels?: IParcel[];
}
