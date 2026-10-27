/** Physical table name. */
export const PARCELS_TABLE = 'parcels';

/** Explicit constraint names; the migration, the entity and the error mapping must agree on them. */
export const PARCEL_CONSTRAINTS = {
  primaryKey: 'pk_parcels',
  foreignKeyProject: 'fk_parcels_project_id',
  uniqueProjectName: 'uq_parcels_project_id_name',
  checkGeometryValid: 'chk_parcels_geom_valid',
  checkFillColor: 'chk_parcels_fill_color',
  checkStrokeColor: 'chk_parcels_stroke_color',
  checkFillOpacity: 'chk_parcels_fill_opacity',
  checkStrokeWidth: 'chk_parcels_stroke_width',
} as const;

/** Explicit index names. */
export const PARCEL_INDEXES = {
  geomGist: 'idx_parcels_geom_gist',
  projectCreated: 'idx_parcels_project_id_created_at',
} as const;

/** Validation limits, mirrored by the database check constraints. */
export const PARCEL_LIMITS = {
  nameMaxLength: 120,
  notesMaxLength: 5000,
  strokeWidthMin: 0.5,
  strokeWidthMax: 10,
} as const;

/** Styling applied when the client does not send one (mirrors the column defaults). */
export const PARCEL_DEFAULTS = {
  fillColor: '#2F7D4F',
  fillOpacity: 0.35,
  strokeColor: '#FFFFFF',
  strokeWidth: 2,
} as const;

/** Polygons smaller than this (square meters) are rejected as degenerate. */
export const MIN_PARCEL_AREA_M2 = 1;

/** `#RRGGBB` */
export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
