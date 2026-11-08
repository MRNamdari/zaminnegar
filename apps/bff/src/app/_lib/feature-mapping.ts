import {
  positionSchema,
  type AreaFeature,
  type Level,
  type PolygonGeometry,
} from '@/app/features/map-editor';
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Feature ids                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The editor works with one flat collection of features and opaque string ids, while the
 * API keeps regions, blocks and parcels in separate tables. A feature id therefore carries
 * its level: `parcel:<uuid>`. That lets update/delete find the right endpoint without a
 * lookup, and keeps ids unique across levels. Drafts use the editor's own `draft:` prefix.
 */
export const toFeatureId = (level: Level, uuid: string): string =>
  `${level}:${uuid}`;

export function parseFeatureId(
  featureId: string,
): { level: Level; id: string } | null {
  const separator = featureId.indexOf(':');
  if (separator === -1) return null;
  const level = featureId.slice(0, separator);
  const id = featureId.slice(separator + 1);
  if (!id || (level !== 'region' && level !== 'block' && level !== 'parcel')) {
    return null;
  }
  return { level, id };
}

/* -------------------------------------------------------------------------- */
/*  API payloads (validated at the edge; the generated types are too loose)   */
/* -------------------------------------------------------------------------- */

export const multiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(positionSchema))),
});
export type MultiPolygon = z.infer<typeof multiPolygonSchema>;

export const boundarySchema = z.object({
  id: z.string(),
  geometry: multiPolygonSchema,
  areaM2: z.number(),
  updatedAt: z.string(),
});
export type ApiBoundary = z.infer<typeof boundarySchema>;

const baseEntity = {
  id: z.string(),
  boundaryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string(),
  updatedAt: z.string(),
};
export const regionSchema = z.object(baseEntity);
export const blockSchema = z.object({ ...baseEntity, regionId: z.string() });
export const parcelSchema = z.object({
  ...baseEntity,
  regionId: z.string(),
  blockId: z.string().nullable(),
});
export type ApiRegion = z.infer<typeof regionSchema>;
export type ApiBlock = z.infer<typeof blockSchema>;
export type ApiParcel = z.infer<typeof parcelSchema>;
export type ApiEntity = ApiRegion | ApiBlock | ApiParcel;

export const pageSchema = <S extends z.ZodType>(item: S) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  });

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                  */
/* -------------------------------------------------------------------------- */

/** The editor draws single polygons; the API stores MultiPolygons. */
export const toMultiPolygon = (polygon: PolygonGeometry): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: [polygon.coordinates],
});

/**
 * Returns `null` for a MultiPolygon with more than one part: the editor cannot represent
 * it, and showing only one part would let a later save overwrite the others.
 */
export function toPolygon(multi: MultiPolygon): PolygonGeometry | null {
  const [only, ...rest] = multi.coordinates;
  if (!only || rest.length > 0) return null;
  return { type: 'Polygon', coordinates: only };
}

/* -------------------------------------------------------------------------- */
/*  Entity + boundary -> editor feature                                       */
/* -------------------------------------------------------------------------- */

const timestamp = (iso: string): number => {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
};

function parentOf(level: Level, entity: ApiEntity): string | null {
  if (level === 'region') return null;
  if (level === 'block') {
    return toFeatureId('region', (entity as ApiBlock).regionId);
  }
  const parcel = entity as ApiParcel;
  return parcel.blockId
    ? toFeatureId('block', parcel.blockId)
    : toFeatureId('region', parcel.regionId);
}

/**
 * `version` is the newest `updatedAt` of the entity and its boundary (geometry edits touch
 * the boundary row), as epoch milliseconds. The API does not enforce it (see README note),
 * but the editor's conflict detection compares it between refetches.
 */
export function toFeature(
  level: Level,
  entity: ApiEntity,
  boundary: ApiBoundary,
): AreaFeature | null {
  const geometry = toPolygon(boundary.geometry);
  if (!geometry) return null;
  return {
    type: 'Feature',
    id: toFeatureId(level, entity.id),
    geometry,
    properties: {
      level,
      name: entity.name,
      areaHa: boundary.areaM2 / 10_000,
      version: Math.max(
        timestamp(entity.updatedAt),
        timestamp(boundary.updatedAt),
      ),
      parentId: parentOf(level, entity),
      status: entity.status,
      boundaryId: entity.boundaryId,
    },
  };
}
