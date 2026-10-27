import type { components } from './generated/schema';

/** All schemas published by the API, keyed by DTO class name. */
export type Schemas = components['schemas'];

export type CreateProjectDto = Schemas['CreateProjectDto'];
export type ProjectDto = Schemas['ProjectDto'];
export type ProjectListDto = Schemas['ProjectListDto'];

export type MultiPolygonDto = Schemas['MultiPolygonDto'];
export type CreateParcelDto = Schemas['CreateParcelDto'];
export type UpdateParcelDto = Schemas['UpdateParcelDto'];
export type ParcelDto = Schemas['ParcelDto'];
export type ParcelFeatureDto = Schemas['ParcelFeatureDto'];
export type ParcelFeatureCollectionDto = Schemas['ParcelFeatureCollectionDto'];

export type ErrorResponseDto = Schemas['ErrorResponseDto'];
export type ValidationErrorDetailDto = Schemas['ValidationErrorDetailDto'];
