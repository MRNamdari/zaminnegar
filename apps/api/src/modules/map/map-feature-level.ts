import { Resource } from '../access/permissions';
import type { MapFeatureLevel } from './dto/map-feature-response.dto';

export const MAP_FEATURE_LEVELS: readonly MapFeatureLevel[] = ['region', 'block', 'parcel'];

export const MAP_FEATURE_STATUSES = ['active', 'inactive'] as const;
export type MapFeatureStatusValue = (typeof MAP_FEATURE_STATUSES)[number];

/** The permission resource that governs each level of the map hierarchy. */
export const RESOURCE_OF_LEVEL: Readonly<Record<MapFeatureLevel, Resource>> = {
  region: Resource.region,
  block: Resource.block,
  parcel: Resource.parcel,
};
