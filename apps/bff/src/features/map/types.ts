/** `[longitude, latitude]` in WGS 84. */
export type Position = [longitude: number, latitude: number];

/** `[west, south, east, north]`. */
export type Bounds = [west: number, south: number, east: number, north: number];

/** Raster tile source description (satellite or street imagery). */
export interface ImageryConfig {
  tiles: string[];
  tileSize: number;
  maxzoom: number;
  attribution: string;
}

/** Everything the map needs from server-side configuration. */
export interface MapConfig {
  imagery: ImageryConfig;
  defaultCenter: Position;
  defaultZoom: number;
  /** Set when the configured provider could not be used (missing key) and Esri was substituted. */
  imageryFallback: boolean;
}
