import { IBlock } from "../blocks/interface";
import { IParcelOwner } from "../owners/interface";

export interface IParcel {
  id: string;
  projectId: string;
  blockId?: string | null;
  name: string;
  /** Boundary in WGS 84 (EPSG:4326), `[longitude, latitude]`. */
  geometry: IMultiPolygon;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  notes: string | null;
  status: "فعال" | "غیر فعال";
  /** Geodesic area in square meters, computed by PostGIS (`ST_Area(geom::geography)`). */
  areaM2: string;
  createdAt: Date;
  updatedAt: Date;
  block?: "بلوک 1" | "بلوک 2" | "بلوک 3" | "بلوک 4";
  owners?: IParcelOwner[];
}

export type Position = [longitude: number, latitude: number];

/** A GeoJSON MultiPolygon: polygons → rings → positions. Rings are closed (first == last). */
export interface IMultiPolygon {
  type: "MultiPolygon";
  coordinates: Position[][][];
}
