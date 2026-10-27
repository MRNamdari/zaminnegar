/** One place returned by the geocoder. */
export interface Place {
  name: string;
  lon: number;
  lat: number;
  /** `[west, south, east, north]`, when the geocoder knows the extent. */
  bbox: [number, number, number, number] | null;
}
