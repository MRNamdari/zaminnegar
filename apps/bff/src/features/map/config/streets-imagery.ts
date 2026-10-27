import type { ImageryConfig } from '../types';

/** OpenStreetMap raster tiles used by the optional "streets" basemap. Respect the OSM tile usage policy. */
export const STREETS_IMAGERY: ImageryConfig = {
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  maxzoom: 19,
  attribution: '© OpenStreetMap contributors',
};
