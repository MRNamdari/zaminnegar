import type { components } from './generated/schema';

/** All schemas published by the API, keyed by DTO class name. */
export type Schemas = components['schemas'];

export type CreateProjectDto = Schemas['CreateProjectDto'];
export type ProjectDto = Schemas['ProjectDto'];
export type ProjectListDto = Schemas['ProjectListDto'];

export type RegionDto = Schemas['RegionDto'];
export type RegionListDto = Schemas['RegionListDto'];
export type CreateRegionDto = Schemas['CreateRegionDto'];

export type BlockDto = Schemas['BlockDto'];
export type BlockListDto = Schemas['BlockListDto'];
export type CreateBlockDto = Schemas['CreateBlockDto'];

export type OwnerDto = Schemas['OwnerDto'];
export type OwnerListDto = Schemas['OwnerListDto'];
export type CreateOwnerDto = Schemas['CreateOwnerDto'];

export type ParcelOwnerDto = Schemas['ParcelOwnerDto'];
export type ParcelOwnerListDto = Schemas['ParcelOwnerDto'][];
export type CreateParcelOwnerDto = Schemas['CreateParcelOwnerDto'];

export type MultiPolygonDto = Schemas['MultiPolygonDto'];
export type CreateParcelDto = Schemas['CreateParcelDto'];
export type UpdateParcelDto = Schemas['UpdateParcelDto'];
export type ParcelDto = Schemas['ParcelDto'];
export type ParcelFeatureDto = Schemas['ParcelFeatureDto'];
export type ParcelFeatureCollectionDto = Schemas['ParcelFeatureCollectionDto'];

export type ErrorResponseDto = Schemas['ErrorResponseDto'];
