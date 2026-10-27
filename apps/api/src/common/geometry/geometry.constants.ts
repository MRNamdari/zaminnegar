/** EPSG code of WGS 84, the only coordinate system the API stores and serves. */
export const SRID_WGS84 = 4326;

/** Upper bound on vertices per geometry; protects the database from abusive payloads. */
export const MAX_GEOMETRY_VERTICES = 5000;
