/** Physical table name. */
export const BLOCKS_TABLE = 'blocks';

export const BLOCK_CONSTRAINTS = {
  primaryKey: 'pk_blocks',
  uniqueRegionName: 'uq_blocks_region_id_name',
  foreignKeyRegion: 'fk_blocks_region_id',
} as const;

export const BLOCK_INDEXES = {
  regionCreated: 'idx_blocks_region_id_created_at',
  updatedAt: 'idx_blocks_updated_at',
} as const;

export const BLOCK_LIMITS = {
  nameMaxLength: 120,
  descriptionMaxLength: 2000,
} as const;
