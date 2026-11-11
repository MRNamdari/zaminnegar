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
import { api } from './api.client';
import {
  blockSchema,
  boundarySchema,
  pageSchema,
  parcelSchema,
  parseFeatureId,
  regionSchema,
  toEntityStatus,
  toFeature,
  toFeatureId,
  toMultiPolygon,
  type ApiEntity,
  type MultiPolygon,
} from './feature-mapping';

/* -------------------------------------------------------------------------- */
/*  Transport                                                                 */
/* -------------------------------------------------------------------------- */

/** The API's maximum page size. */
const PAGE_SIZE = 100;

/** Safety net against a runaway `total`; 200 pages is 20,000 rows per list. */
const MAX_PAGES = 200;

type RawResponse = {
  ok: boolean;
  status: number;
  data: unknown;
};

/** Narrows the generated client's typed response to the small shape the gateway works with. */
const raw = (
  call: Promise<{ ok: boolean; status: number; data: unknown }>,
): Promise<RawResponse> =>
  call.then(({ ok, status, data }) => ({ ok, status, data }));

/**
 * The generated input types are stricter than what the API accepts for partial PATCH bodies
 * and GeoJSON geometry. The assertion lives here, at the transport boundary, and nowhere else.
 */
const apiBody = (value: unknown): never => value as never;

const requestOptions = (signal?: AbortSignal) =>
  signal ? { overrides: { signal } } : {};

type ListQuery = { projectId: string; page: number; limit: number };

/**
 * Everything level-specific lives in this table, so the rest of the file is written once
 * for all three levels. Boundaries are not a level; they have their own helpers below.
 */
type Resource = {
  readonly what: string;
  readonly schema: z.ZodType<ApiEntity>;
  list(query: ListQuery, signal?: AbortSignal): Promise<RawResponse>;
  patch(id: string, body: unknown): Promise<RawResponse>;
  remove(id: string): Promise<RawResponse>;
};

const RESOURCES: Record<Level, Resource> = {
  region: {
    what: 'region',
    schema: regionSchema,
    list: (query, signal) =>
      raw(
        api.client.get('/regions', {
          query,
          ...requestOptions(signal),
          withResponse: true,
        }),
      ),
    patch: (id, body) =>
      raw(
        api.client.patch('/regions/{id}', {
          path: { id },
          body: apiBody(body),
          withResponse: true,
        }),
      ),
    remove: (id) =>
      raw(
        api.client.delete('/regions/{id}', {
          path: { id },
          withResponse: true,
        }),
      ),
  },
  block: {
    what: 'block',
    schema: blockSchema,
    list: (query, signal) =>
      raw(
        api.client.get('/blocks', {
          query,
          ...requestOptions(signal),
          withResponse: true,
        }),
      ),
    patch: (id, body) =>
      raw(
        api.client.patch('/blocks/{id}', {
          path: { id },
          body: apiBody(body),
          withResponse: true,
        }),
      ),
    remove: (id) =>
      raw(
        api.client.delete('/blocks/{id}', { path: { id }, withResponse: true }),
      ),
  },
  parcel: {
    what: 'parcel',
    schema: parcelSchema,
    list: (query, signal) =>
      raw(
        api.client.get('/parcels', {
          query,
          ...requestOptions(signal),
          withResponse: true,
        }),
      ),
    patch: (id, body) =>
      raw(
        api.client.patch('/parcels/{id}', {
          path: { id },
          body: apiBody(body),
          withResponse: true,
        }),
      ),
    remove: (id) =>
      raw(
        api.client.delete('/parcels/{id}', {
          path: { id },
          withResponse: true,
        }),
      ),
  },
};

/* -------------------------------------------------------------------------- */
/*  Errors                                                                    */
/* -------------------------------------------------------------------------- */

/** Backend error codes (see `apps/api/src/common/errors`) that mean "this shape is not allowed". */
const GEOMETRY_CODES = new Set([
  'INVALID_GEOMETRY',
  'GEOMETRY_OUTSIDE_CONTAINER',
  'CHILD_OUTSIDE_GEOMETRY',
]);

/**
 * Maps an API error body (`{ code, message }`; `message` is an array for request validation
 * failures) to the editor's error model. Bodies that are not JSON objects, such as an HTML
 * error page from a proxy, fall back to a generic message.
 */
function httpError(
  status: number,
  body: unknown,
  featureId?: string,
): EditorError {
  const { code, message } = (
    typeof body === 'object' && body !== null ? body : {}
  ) as { code?: unknown; message?: unknown };

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

  // Overlaps, taken names, non-empty parents, reparenting: the API understood and refused.
  if (status === 409 || status === 422 || status === 403) {
    return applicationError('rejected', text, featureId);
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
  featureId?: string,
): ResultAsync<z.output<S>, EditorError> {
  return ResultAsync.fromPromise(call, toEditorError).andThen(
    (response): Result<z.output<S>, EditorError> =>
      response.ok
        ? parseResponse(schema, response.data, what)
        : err(httpError(response.status, response.data, featureId)),
  );
}

function settleEmpty(
  call: Promise<RawResponse>,
  featureId?: string,
): ResultAsync<void, EditorError> {
  return ResultAsync.fromPromise(call, toEditorError).andThen(
    (response): Result<void, EditorError> =>
      response.ok
        ? ok(undefined)
        : err(httpError(response.status, response.data, featureId)),
  );
}

/**
 * Reads every page of a list endpoint: page 1 first (it carries `total`), then the remaining
 * pages in parallel.
 */
function listAll<S extends z.ZodType>(
  fetchPage: (page: number) => Promise<RawResponse>,
  item: S,
  what: string,
): ResultAsync<z.output<S>[], EditorError> {
  const pages = pageSchema(item);

  return new ResultAsync(
    (async (): Promise<Result<z.output<S>[], EditorError>> => {
      const first = await settle(fetchPage(1), pages, what);
      if (first.isErr()) return err(first.error);

      const items: z.output<S>[] = [...first.value.items];
      const limit = first.value.limit > 0 ? first.value.limit : PAGE_SIZE;
      const wanted = Math.ceil(first.value.total / limit);
      const pageCount = Math.min(wanted, MAX_PAGES);

      if (wanted > MAX_PAGES) {
        console.warn(
          `[map-editor] ${what}: only the first ${MAX_PAGES} pages were loaded`,
        );
      }

      if (pageCount <= 1) return ok(items);

      const rest = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          settle(fetchPage(index + 2), pages, what),
        ),
      );

      for (const result of rest) {
        if (result.isErr()) return err(result.error);
        items.push(...result.value.items);
      }

      return ok(items);
    })(),
  );
}

/* -------------------------------------------------------------------------- */
/*  Reading                                                                   */
/* -------------------------------------------------------------------------- */

const getBoundary = (id: string, signal?: AbortSignal) =>
  settle(
    raw(
      api.client.get('/boundaries/{id}', {
        path: { id },
        ...requestOptions(signal),
        withResponse: true,
      }),
    ),
    boundarySchema,
    'boundary',
  );

const getBlock = (id: string) =>
  settle(
    raw(api.client.get('/blocks/{id}', { path: { id }, withResponse: true })),
    blockSchema,
    'block',
  );

/**
 * The whole project as one feature collection. Geometry lives in `boundaries`, so regions,
 * blocks and parcels are loaded next to them and joined by `boundaryId`. Features whose
 * boundary has several parts are left out (the editor cannot show them without risking
 * a later save overwriting the missing parts).
 */
export function fetchFeatures(
  projectId: string,
  signal?: AbortSignal,
): ResultAsync<AreaCollection, EditorError> {
  const query = (page: number): ListQuery => ({
    projectId,
    page,
    limit: PAGE_SIZE,
  });

  const levelList = <S extends z.ZodType>(level: Level, schema: S) =>
    listAll(
      (page) => RESOURCES[level].list(query(page), signal),
      schema,
      `${level} list`,
    );

  return ResultAsync.combine([
    listAll(
      (page) =>
        raw(
          api.client.get('/boundaries', {
            query: query(page),
            ...requestOptions(signal),
            withResponse: true,
          }),
        ),
      boundarySchema,
      'boundary list',
    ),
    levelList('region', regionSchema),
    levelList('block', blockSchema),
    levelList('parcel', parcelSchema),
  ] as const).map(([boundaries, regions, blocks, parcels]) => {
    const boundaryById = new Map(boundaries.map((b) => [b.id, b]));
    const features: AreaFeature[] = [];
    const skipped: string[] = [];

    const add = (level: Level, entities: readonly ApiEntity[]) => {
      for (const entity of entities) {
        const boundary = boundaryById.get(entity.boundaryId);
        const feature = boundary ? toFeature(level, entity, boundary) : null;

        if (feature) {
          features.push(feature);
        } else {
          skipped.push(toFeatureId(level, entity.id));
        }
      }
    };

    // Parents first, so children are drawn on top of them.
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

/**
 * Create/update responses carry no geometry, so the canonical feature is rebuilt from
 * its boundary.
 */
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

  const base = {
    projectId,
    name,
    geometry: toMultiPolygon(geometry),
    // Only what the API accepts; `undefined` is dropped by JSON.stringify, so the API default applies.
    status: toEntityStatus(properties.status),
  };

  const description =
    typeof properties.description === 'string'
      ? properties.description
      : undefined;

  const parent = properties.parentId
    ? parseFeatureId(properties.parentId)
    : null;

  const post = (
    path: '/regions' | '/blocks' | '/parcels',
    body: unknown,
    schema: z.ZodType<ApiEntity>,
    what: string,
  ) =>
    settle(
      raw(api.client.post(path, { body: apiBody(body), withResponse: true })),
      schema,
      what,
    );

  switch (level) {
    case 'region':
      return post('/regions', { ...base, description }, regionSchema, 'region');

    case 'block':
      if (parent?.level !== 'region') {
        return rejected('A block must be drawn inside a region');
      }

      return post(
        '/blocks',
        { ...base, description, regionId: parent.id },
        blockSchema,
        'block',
      );

    case 'parcel': {
      // Parcels have no description in the API, and the API forbids unknown fields.
      const createParcel = (regionId: string, blockId?: string) =>
        post(
          '/parcels',
          { ...base, regionId, blockId },
          parcelSchema,
          'parcel',
        );

      if (parent?.level === 'region') return createParcel(parent.id);

      // A parcel inside a block also needs the block's regionId.
      if (parent?.level === 'block') {
        return getBlock(parent.id).andThen((block) =>
          createParcel(block.regionId, block.id),
        );
      }

      return rejected('A parcel must be drawn inside a region or a block');
    }
  }
}

function patchEntity(
  level: Level,
  id: string,
  patch: { name?: string; geometry: MultiPolygon },
): ResultAsync<ApiEntity, EditorError> {
  const resource = RESOURCES[level];

  return settle(
    resource.patch(id, patch),
    resource.schema,
    resource.what,
    toFeatureId(level, id),
  );
}

const unknownFeature = (featureId: string) =>
  errAsync<never, EditorError>(
    domainError('feature_not_found', `Unknown feature id "${featureId}"`),
  );

/**
 * The editor's transport. `expectedVersion` is accepted but not sent: the API has no version
 * check yet, so stale writes are not rejected server-side.
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

      return settleEmpty(RESOURCES[target.level].remove(target.id), id).map(
        () => ({ id }),
      );
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Project                                                                   */
/* -------------------------------------------------------------------------- */

const projectPageSchema = pageSchema(z.object({ id: z.string() }));

/**
 * The dashboard has no project picker yet, so the map uses `NEXT_PUBLIC_PROJECT_ID` when set
 * and otherwise the first project returned by the API. `null` means there is no project.
 */
export function resolveProjectId(
  signal?: AbortSignal,
): ResultAsync<string | null, EditorError> {
  const configured = process.env.NEXT_PUBLIC_PROJECT_ID;

  if (configured)
    return ResultAsync.fromSafePromise(Promise.resolve(configured));

  return settle(
    raw(
      api.client.get('/projects', {
        query: { page: 1, limit: 1 },
        ...requestOptions(signal),
        withResponse: true,
      }),
    ),
    projectPageSchema,
    'project list',
  ).map((page) => page.items[0]?.id ?? null);
}
