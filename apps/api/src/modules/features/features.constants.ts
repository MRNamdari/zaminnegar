/** Physical table name. */
export const FEATURES_TABLE = 'features';

/** Explicit constraint names; the migration, the entity and the error mapping must agree on them. */
export const FEATURE_CONSTRAINTS = {
  primaryKey: 'pk_features',
  foreignKeyProject: 'fk_features_project_id',
  uniqueFeatureName: 'uq_features_feature_id_name',
  checkGeometryValid: 'chk_features_geom_valid',
} as const;

/** Explicit index names. */
export const FEATURE_INDEXES = {
  geomGist: 'idx_features_geom_gist',
  featureCreated: 'idx_features_feature_id_created_at',
} as const;

/** Polygons smaller than this (square meters) are rejected as degenerate. */
export const MIN_FEATURE_AREA_M2 = 1;

export const FEATURE_LIMITS = {
  nameMaxLength: 100,
};
