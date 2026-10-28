/** Physical table names. */
export const OWNERS_TABLE = 'owners';
export const PARCEL_OWNERS_TABLE = 'parcel_owners';

export const OWNER_CONSTRAINTS = {
  primaryKey: 'pk_owners',
  uniqueName: 'uq_owners_name',
} as const;

export const PARCEL_OWNER_CONSTRAINTS = {
  primaryKey: 'pk_parcel_owners',
  foreignKeyParcel: 'fk_parcel_owners_parcel_id',
  foreignKeyOwner: 'fk_parcel_owners_owner_id',
  uniqueParcelOwner: 'uq_parcel_owners_parcel_owner',
} as const;

export const OWNER_INDEXES = {
  updatedAt: 'idx_owners_updated_at',
} as const;

export const OWNER_LIMITS = {
  nameMaxLength: 120,
  phoneMaxLength: 40,
  emailMaxLength: 255,
} as const;
