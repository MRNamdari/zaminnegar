import type { components } from '@zaminnegar/api-client';
import { ResultAsync, err, errAsync, ok, type Result } from 'neverthrow';
import { z } from 'zod';
import {
  applicationError,
  domainError,
  networkError,
  parseResponse,
  toEditorError,
  validationError,
  type AreaCollection,
  type AreaFeature,
  type CreateFeatureRequest,
  type EditorError,
  type FeatureGateway,
  type Level,
} from '@/app/features/map-editor';
import { api } from './api';
import {
  blockSchema,
  boundarySchema,
  pageSchema,
  parcelSchema,
  parseFeatureId,
  regionSchema,
  toFeature,
  toFeatureId,
  toMultiPolygon,
  type ApiBlock,
  type ApiEntity,
  type ApiParcel,
  type ApiRegion,
} from './feature-mapping';

type Schemas = components['schemas'];

/** What every `api.*` call resolves to, whatever its path. */
interface RawResponse {
  data?: unknown;
  error?: unknown;
  response: Response;
}

const PAGE_SIZE = 100; // the API's maximum

/**
 * The generated types mark fields with an OpenAPI `@default` as required (so a PATCH body
 * would have to repeat `description` and `status`, resetting them) and type `geometry` as
 * `Record<string, never>`. Request bodies are built from typed values above and cast here,
 * in one place.
 */
const asBody = <T>(value: unknown): T => value as T;

/* -------------------------------------------------------------------------- */
/*  Errors                                                                    */
/* -------------------------------------------------------------------------- */

const GEOMETRY_CODES = new Set([
  'INVALID_GEOMETRY',
  'GEOMETRY_OUTSIDE_CONTAINER',
  'CHILD_OUTSIDE_GEOMETRY',
]);

/**
 * Maps the API's `{ code, message }` error bodies to editor errors. 409 is *not* the
 * editor's `conflict` (that means "someone else changed this feature"): here it is an
 * overlap, a taken name or a non-empty region, i.e. a rejected operation.
 */
function httpError(status: number, body: unknown): EditorError {
  const { code, message } = (body ?? {}) as {
    code?: unknown;
    message?: unknown;
  };
  const text = Array.isArray(message)
    ? message.join('; ')
    : typeof message === 'string'
      ? message
      : `Backend responded with ${status}`;

  if (status === 404) return domainError('feature_not_found', text);
  if (status === 400) return validationError('invalid_schema', text);
  if (typeof code === 'string' && GEOMETRY_CODES.has(code)) {
    return validationError('invalid_geometry', text);
  }
  if (status === 409 || status === 422 || status === 403) {
    return applicationError('rejected', text);
  }
  return networkError('http', text, { status, retryable: status >= 500 });
}

const rejected = (message: string) =>
  errAsync<never, EditorError>(applicationError('rejected', message));

/* -------------------------------------------------------------------------- */
/*  Call helpers                                                              */
/* -------------------------------------------------------------------------- */

function settle<S extends z.ZodType>(
  call: Promise<RawResponse>,
  schema: S,
  what: string,
): ResultAsync<z.output<S>, EditorError> {
  return ResultAsync.fromPromise(call, toEditorError).andThen(
    ({ data, error, response }): Result<z.output<S>, EditorError> =>
      response.ok
        ? parseResponse(schema, data, what)
        : err(httpError(response.status, error)),
  );
}

function settleEmpty(
  call: Promise<RawResponse>,
): ResultAsync<void, EditorError> {
  return ResultAsync.fromPromise(call, toEditorError).andThen(
    ({ error, response }): Result<void, EditorError> =>
      response.ok ? ok(undefined) : err(httpError(response.status, error)),
  );
}

/** Reads every page of a list endpoint. */
function listAll<S extends z.ZodType>(
  fetchPage: (page: number) => Promise<RawResponse>,
  item: S,
  what: string,
): ResultAsync<z.output<S>[], EditorError> {
  const pages = pageSchema(item);
  return new ResultAsync(
    (async (): Promise<Result<z.output<S>[], EditorError>> => {
      const items: z.output<S>[] = [];
      for (let page = 1; ; page++) {
        const result = await settle(fetchPage(page), pages, what);
        if (result.isErr()) return err(result.error);
        items.push(...(result.value.items as z.output<S>[]));
        if (
          result.value.items.length === 0 ||
          items.length >= result.value.total
        ) {
          return ok(items);
        }
      }
    })(),
  );
}

/* -------------------------------------------------------------------------- */
/*  Reading                                                                   */
/* -------------------------------------------------------------------------- */

const getBoundary = (id: string, signal?: AbortSignal) =>
  settle(
    api.GET('/boundaries/{id}', { params: { path: { id } }, signal }),
    boundarySchema,
    'boundary',
  );

const getBlock = (id: string) =>
  settle(
    api.GET('/blocks/{id}', { params: { path: { id } } }),
    blockSchema,
    'block',
  );

/**
 * The whole project as one feature collection. Geometry lives in `boundaries`, so regions,
 * blocks and parcels are loaded next to them and joined by `boundaryId`. Features whose
 * boundary has several parts are left out (see `toPolygon`).
 */
export function fetchFeatures(
  projectId: string,
  signal?: AbortSignal,
): ResultAsync<AreaCollection, EditorError> {
  const query = (page: number) => ({ projectId, page, limit: PAGE_SIZE });

  return ResultAsync.combine([
    listAll(
      (page) =>
        api.GET('/boundaries', { params: { query: query(page) }, signal }),
      boundarySchema,
      'boundary list',
    ),
    listAll(
      (page) => api.GET('/regions', { params: { query: query(page) }, signal }),
      regionSchema,
      'region list',
    ),
    listAll(
      (page) => api.GET('/blocks', { params: { query: query(page) }, signal }),
      blockSchema,
      'block list',
    ),
    listAll(
      (page) => api.GET('/parcels', { params: { query: query(page) }, signal }),
      parcelSchema,
      'parcel list',
    ),
  ] as const).map(([boundaries, regions, blocks, parcels]) => {
    const boundaryById = new Map(boundaries.map((b) => [b.id, b]));
    const features: AreaFeature[] = [];
    const skipped: string[] = [];

    const add = (level: Level, entities: readonly ApiEntity[]) => {
      for (const entity of entities) {
        const boundary = boundaryById.get(entity.boundaryId);
        const feature = boundary ? toFeature(level, entity, boundary) : null;
        if (feature) features.push(feature);
        else skipped.push(toFeatureId(level, entity.id));
      }
    };
    add('region', regions);
    add('block', blocks);
    add('parcel', parcels);

    if (skipped.length > 0) {
      console.warn(
        `[map-editor] ${skipped.length} feature(s) not shown (multi-part or missing boundary):`,
        skipped,
      );
    }
    return { type: 'FeatureCollection', features } satisfies AreaCollection;
  });
}

/** Create/update responses carry no geometry, so the canonical feature is rebuilt from its boundary. */
const hydrate = (
  level: Level,
  entity: ApiEntity,
): ResultAsync<AreaFeature, EditorError> =>
  getBoundary(entity.boundaryId).andThen((boundary) => {
    const feature = toFeature(level, entity, boundary);
    return feature
      ? ok(feature)
      : err(
          applicationError(
            'operation_failed',
            'The saved boundary has several parts and cannot be shown in the editor',
            toFeatureId(level, entity.id),
          ),
        );
  });

/* -------------------------------------------------------------------------- */
/*  Writing                                                                   */
/* -------------------------------------------------------------------------- */

function createEntity(
  projectId: string,
  request: CreateFeatureRequest,
): ResultAsync<ApiEntity, EditorError> {
  const { geometry, properties } = request;
  const { level, name } = properties;
  const multi = toMultiPolygon(geometry);
  const parent = properties.parentId
    ? parseFeatureId(properties.parentId)
    : null;

  if (level === 'region') {
    return settle(
      api.POST('/regions', {
        body: asBody<Schemas['CreateRegionDto']>({
          projectId,
          name,
          geometry: multi,
        }),
      }),
      regionSchema,
      'region',
    );
  }

  if (level === 'block') {
    if (parent?.level !== 'region')
      return rejected('A block must be drawn inside a region');
    return settle(
      api.POST('/blocks', {
        body: asBody<Schemas['CreateBlockDto']>({
          projectId,
          regionId: parent.id,
          name,
          geometry: multi,
        }),
      }),
      blockSchema,
      'block',
    );
  }

  const createParcel = (regionId: string, blockId?: string) =>
    settle(
      api.POST('/parcels', {
        body: asBody<Schemas['CreateParcelDto']>({
          projectId,
          regionId,
          ...(blockId ? { blockId } : {}),
          name,
          geometry: multi,
        }),
      }),
      parcelSchema,
      'parcel',
    );

  if (parent?.level === 'region') return createParcel(parent.id);
  // The API wants the region too; a parcel inside a block belongs to that block's region.
  if (parent?.level === 'block') {
    return getBlock(parent.id).andThen((block) =>
      createParcel(block.regionId, block.id),
    );
  }
  return rejected('A parcel must be drawn inside a region or a block');
}

function patchEntity(
  level: Level,
  id: string,
  patch: { name?: string; geometry: ReturnType<typeof toMultiPolygon> },
): ResultAsync<ApiEntity, EditorError> {
  const params = { path: { id } };
  switch (level) {
    case 'region':
      return settle(
        api.PATCH('/regions/{id}', {
          params,
          body: asBody<Schemas['UpdateRegionDto']>(patch),
        }),
        regionSchema,
        'region',
      );
    case 'block':
      return settle(
        api.PATCH('/blocks/{id}', {
          params,
          body: asBody<Schemas['UpdateBlockDto']>(patch),
        }),
        blockSchema,
        'block',
      );
    case 'parcel':
      return settle(
        api.PATCH('/parcels/{id}', {
          params,
          body: asBody<Schemas['UpdateParcelDto']>(patch),
        }),
        parcelSchema,
        'parcel',
      );
  }
}

function deleteEntity(
  level: Level,
  id: string,
): ResultAsync<void, EditorError> {
  const params = { path: { id } };
  switch (level) {
    case 'region':
      return settleEmpty(api.DELETE('/regions/{id}', { params }));
    case 'block':
      return settleEmpty(api.DELETE('/blocks/{id}', { params }));
    case 'parcel':
      return settleEmpty(api.DELETE('/parcels/{id}', { params }));
  }
}

const unknownFeature = (featureId: string) =>
  errAsync<never, EditorError>(
    domainError('feature_not_found', `Unknown feature id "${featureId}"`),
  );

/**
 * The editor's transport. `expectedVersion` is accepted but not sent: the API has no
 * version check yet, so a stale write is not rejected server-side.
 */
export function createFeatureGateway(
  projectId: string | undefined,
): FeatureGateway {
  return {
    create: (request) =>
      projectId
        ? createEntity(projectId, request).andThen((entity) =>
            hydrate(request.properties.level, entity),
          )
        : rejected('No project is selected'),

    update: (request) => {
      const target = parseFeatureId(request.id);
      if (!target) return unknownFeature(request.id);
      return patchEntity(target.level, target.id, {
        geometry: toMultiPolygon(request.geometry),
        ...(request.properties?.name ? { name: request.properties.name } : {}),
      }).andThen((entity) => hydrate(target.level, entity));
    },

    remove: ({ id }) => {
      const target = parseFeatureId(id);
      if (!target) return unknownFeature(id);
      return deleteEntity(target.level, target.id).map(() => ({ id }));
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Project                                                                   */
/* -------------------------------------------------------------------------- */

const projectPageSchema = pageSchema(z.object({ id: z.string() }));

/**
 * The dashboard has no project picker yet, so the map uses `NEXT_PUBLIC_PROJECT_ID` when
 * set and otherwise the first project the API returns. `null` means there is none.
 */
export function resolveProjectId(
  signal?: AbortSignal,
): ResultAsync<string | null, EditorError> {
  const configured = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (configured)
    return ResultAsync.fromSafePromise(Promise.resolve(configured));
  return settle(
    api.GET('/projects', { params: { query: { page: 1, limit: 1 } }, signal }),
    projectPageSchema,
    'project list',
  ).map((page) => page.items[0]?.id ?? null);
}
