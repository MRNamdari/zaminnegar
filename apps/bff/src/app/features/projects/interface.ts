export interface Projects {
  id: string;
  geometry: IMultiPolygon;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  boundaries?: string;
  regions?: string;
  blocks?: string;
  parcels?: string;
  owners?: string;
  status: 'فعال' | 'غیر فعال' | 'در انتظار';
}
export type Position = [longitude: number, latitude: number];

/** A GeoJSON MultiPolygon: polygons → rings → positions. Rings are closed (first == last). */
export interface IMultiPolygon {
  type: "MultiPolygon";
  coordinates: Position[][][];
}