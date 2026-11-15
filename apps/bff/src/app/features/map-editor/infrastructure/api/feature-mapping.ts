import type {
  BlockResponseDto,
  BoundaryResponseDto,
  ParcelResponseDto,
  RegionResponseDto,
} from '@zaminnegar/api-client';
import { err, ok, type Result } from 'neverthrow';
import type { EditorError } from '../../core/errors';
import {
  areaFeatureSchema,
  type AreaFeature,
  type Level,
  type PolygonGeometry,
} from '../../core/schemas';
import { invalidResponse } from './error-translation';

/**
 * What a level-specific response says about a feature, minus its geometry (the API only
 * references `boundaryId`). This is the single place where Region, Block and Parcel
 * DTOs are interpreted.
 */
export type FeatureRecord = {
  id: string;
  level: Level;
  boundaryId: string;
  name: string;
  areaM2: number;
  /** Block -> its region; Parcel -> its block, else its region. Derived by the backend. */
  parentId: string | null;
  status: 'active' | 'inactive';
  description?: string;
};

export const regionRecord = (dto: RegionResponseDto): FeatureRecord => ({
  id: dto.id,
  level: 'region',
  boundaryId: dto.boundaryId,
  name: dto.name,
  areaM2: dto.areaM2,
  parentId: null,
  status: dto.status,
  description: dto.description,
});

export const blockRecord = (dto: BlockResponseDto): FeatureRecord => ({
  id: dto.id,
  level: 'block',
  boundaryId: dto.boundaryId,
  name: dto.name,
  areaM2: dto.areaM2,
  parentId: dto.regionId,
  status: dto.status,
  description: dto.description,
});

export const parcelRecord = (dto: ParcelResponseDto): FeatureRecord => ({
  id: dto.id,
  level: 'parcel',
  boundaryId: dto.boundaryId,
  name: dto.name,
  areaM2: dto.areaM2,
  parentId: dto.blockId ?? dto.regionId,
  status: dto.status,
});

/**
 * Record + boundary geometry -> editor feature, validated with the editor's own schema.
 * `version` is deliberately absent: the backend exposes none (see feature-gateway.ts).
 */
export function toAreaFeature(
  record: FeatureRecord,
  geometry: PolygonGeometry,
): Result<AreaFeature, EditorError> {
  const parsed = areaFeatureSchema.safeParse({
    type: 'Feature',
    id: record.id,
    geometry,
    properties: {
      level: record.level,
      name: record.name,
      areaHa: record.areaM2 / 10_000,
      parentId: record.parentId,
      status: record.status,
      boundaryId: record.boundaryId,
      areaM2: record.areaM2,
      ...(record.description !== undefined
        ? { description: record.description }
        : {}),
    },
  });
  return parsed.success ? ok(parsed.data) : err(invalidResponse('feature'));
}

export function toPolygon(multiPolygon: BoundaryResponseDto['geometry']){
  return {type: 'Polygon', coordinates: multiPolygon.coordinates.flat() }
    
}