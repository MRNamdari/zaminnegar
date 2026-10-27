/** Physical table name. */
export const PROJECTS_TABLE = 'projects';

/** Explicit constraint names; the migration, the entity and the error mapping must agree on them. */
export const PROJECT_CONSTRAINTS = {
  primaryKey: 'pk_projects',
  uniqueName: 'uq_projects_name',
} as const;

/** Explicit index names. */
export const PROJECT_INDEXES = {
  updatedAt: 'idx_projects_updated_at',
} as const;

/** Validation limits, mirrored by the database column definitions. */
export const PROJECT_LIMITS = {
  nameMaxLength: 120,
  descriptionMaxLength: 2000,
} as const;
