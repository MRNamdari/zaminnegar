import type { StyleSpecification } from "maplibre-gl";

export const SATELLITE_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
export const STREET_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Both basemaps live in one style; switching is a layout-visibility toggle, so changing
 * the basemap at runtime never reloads the style (which would drop terrain and drawings).
 */
export function buildStyle(basemap: "satellite" | "streets"): StyleSpecification {
  return {
    version: 8,
    sources: {
      satellite: { type: "raster", tiles: [SATELLITE_TILES], tileSize: 256, maxzoom: 18 },
      streets: { type: "raster", tiles: [STREET_TILES], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors" },
      terrain: { type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 256, maxzoom: 15, encoding: "terrarium" },
    },
    layers: [
      { id: "satellite", type: "raster", source: "satellite", layout: { visibility: basemap === "satellite" ? "visible" : "none" } },
      { id: "streets", type: "raster", source: "streets", layout: { visibility: basemap === "streets" ? "visible" : "none" } },
    ],
  };
}
