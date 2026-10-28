/** Physical table name. */
export const REGIONS_TABLE = 'regions';

/** Explicit constraint names; the migration, the entity and the error mapping must agree on them. */
export const REGION_CONSTRAINTS = {
  primaryKey: 'pk_regions',
  uniqueName: 'uq_regions_name',
} as const;

/** Explicit index names. */
export const REGION_INDEXES = {
  updatedAt: 'idx_regions_updated_at',
} as const;

/** Validation limits, mirrored by the database column definitions. */
export const REGION_LIMITS = {
  nameMaxLength: 120,
  descriptionMaxLength: 2000,
} as const;
