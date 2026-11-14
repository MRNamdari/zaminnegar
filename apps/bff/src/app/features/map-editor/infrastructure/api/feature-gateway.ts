import type { ApiClient } from "@zaminnegar/api-client";
import { err, errAsync, ok, ResultAsync, type Result } from "neverthrow";
import type { z } from "zod";
import { applicationError, domainError, validationError, type EditorError } from "../../core/errors";
import {
  createFeatureRequestSchema,
  deleteFeatureRequestSchema,
  levelSchema,
  updateFeatureRequestSchema,
  type AreaCollection,
  type AreaFeature,
  type Level,
} from "../../core/schemas";
import type { FeatureGateway } from "../query/use-feature-operations";
import { translateApiError, invalidResponse, type ErrorContext, type GatewayDiagnostic } from "./error-translation";
import { blockRecord, parcelRecord, regionRecord, toAreaFeature, type FeatureRecord } from "./feature-mapping";
import { fromApiGeometry, toApiGeometry, type ApiMultiPolygon } from "./geometry-mapping";

/**
 * Feature gateway: the anti-corruption layer between the editor's domain and the
 * generated `@zaminnegar/api-client`. Independent of React and TanStack Query.
 *
 * Backend contract this implementation is written against (openapi.json):
 *  - Regions, blocks and parcels are separate resources (`/regions`, `/blocks`, `/parcels`).
 *    Their responses carry no geometry, only a `boundaryId`; geometry is read with
 *    `GET /boundaries/{id}`. So create and update are two requests: write, then read the
 *    boundary, and the editor feature is assembled from both.
 *  - The project comes from the session, so no `projectId` is sent. Block and parcel
 *    parentage (`regionId`, `blockId`) is derived by the database, so no `parentId` is sent.
 *  - **No optimistic concurrency.** No endpoint accepts or returns a version, ETag or
 *    precondition header. A request carrying `expectedVersion` is therefore rejected
 *    rather than silently applied without the guarantee it asked for. Features returned
 *    by this gateway carry no `properties.version`, so the editor's own requests never
 *    include one and writes are last-write-wins.
 *  - No idempotency key on POST: a create whose response is lost cannot be safely retried
 *    automatically.
 */

/** The subset of the generated client the gateway uses; the real `ApiClient` satisfies it. */
export type ApiFeatureClient = Pick<ApiClient, "get" | "post" | "patch" | "delete">;

export type FeatureGatewayOptions = {
  api: ApiFeatureClient;
  /**
   * Reads the canonical feature collection (the TanStack Query cache entry). Used only to
   * discover the level of an existing feature, so update/delete need no extra request.
   */
  getFeatures: () => AreaCollection | undefined;
  /** Receives backend detail (status, code, raw message, original error) that is not shown to users. */
  onDiagnostic?: (diagnostic: GatewayDiagnostic) => void;
};

type CreateBody = {
  name: string;
  geometry: ApiMultiPolygon;
  description?: string;
  status?: "active" | "inactive";
};
type UpdateBody = { name?: string; geometry: ApiMultiPolygon };

/** Per-level endpoint access. The only place that knows which URL belongs to which level. */
type LevelAdapter = {
  create(body: CreateBody): Promise<FeatureRecord>;
  update(id: string, body: UpdateBody): Promise<FeatureRecord>;
  remove(id: string): Promise<void>;
};

/*
 * Updates are sent with `validate: "output"`. The generated client's input validation
 * *parses and replaces* the body, and `UpdateRegionDto` / `UpdateBlockDto` declare
 * `description` with a default of "", so default validation would add `description: ""` to
 * a geometry-only PATCH and wipe the stored description. The body is already validated
 * (editor schemas + typed DTOs), and responses are still validated.
 */
function createLevelAdapters(api: ApiFeatureClient): Record<Level, LevelAdapter> {
  return {
    region: {
      create: async ({ name, geometry, description, status }) =>
        regionRecord(
          await api.post("/regions", {
            body: {
              name,
              geometry,
              ...(description !== undefined ? { description } : {}),
              ...(status !== undefined ? { status } : {}),
            },
          }),
        ),
      update: async (id, body) => regionRecord(await api.patch("/regions/{id}", { path: { id }, body, validate: "output" })),
      remove: async (id) => {
        await api.delete("/regions/{id}", { path: { id } });
      },
    },
    block: {
      create: async ({ name, geometry, description, status }) =>
        blockRecord(
          await api.post("/blocks", {
            body: {
              name,
              geometry,
              ...(description !== undefined ? { description } : {}),
              ...(status !== undefined ? { status } : {}),
            },
          }),
        ),
      update: async (id, body) => blockRecord(await api.patch("/blocks/{id}", { path: { id }, body, validate: "output" })),
      remove: async (id) => {
        await api.delete("/blocks/{id}", { path: { id } });
      },
    },
    parcel: {
      create: async ({ name, geometry, status }) =>
        parcelRecord(
          await api.post("/parcels", {
            body: { name, geometry, ...(status !== undefined ? { status } : {}) },
          }),
        ),
      update: async (id, body) => parcelRecord(await api.patch("/parcels/{id}", { path: { id }, body, validate: "output" })),
      remove: async (id) => {
        await api.delete("/parcels/{id}", { path: { id } });
      },
    },
  };
}

function parseRequest<S extends z.ZodType>(schema: S, request: unknown, what: string): Result<z.output<S>, EditorError> {
  const parsed = schema.safeParse(request);
  if (parsed.success) return ok(parsed.data);
  return err(
    validationError(
      "invalid_schema",
      `Invalid ${what}`,
      parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    ),
  );
}

function rejectExpectedVersion(id: string, expectedVersion: number | undefined): Result<void, EditorError> {
  if (expectedVersion === undefined) return ok(undefined);
  return err(
    applicationError(
      "rejected",
      "The backend does not support version checks, so this change cannot be applied with the requested concurrency guarantee",
      id,
    ),
  );
}

/** Looks the level up in the canonical collection. Never guesses. */
function resolveLevel(collection: AreaCollection | undefined, id: string): Result<Level, EditorError> {
  if (!collection) {
    return err(domainError("invalid_state", `The features are not loaded, so the level of feature ${id} cannot be determined`));
  }
  const feature = collection.features.find((f) => f.id === id);
  if (!feature) return err(domainError("feature_not_found", `Feature ${id} does not exist`));
  const level = levelSchema.safeParse(feature.properties.level);
  return level.success
    ? ok(level.data)
    : err(domainError("invalid_state", `Feature ${id} has no recognised level`));
}

export function createFeatureGateway(options: FeatureGatewayOptions): FeatureGateway {
  const { api, getFeatures, onDiagnostic } = options;
  const adapters = createLevelAdapters(api);

  /** Runs one backend call; every failure is translated and reported exactly once. */
  const run = <T>(call: () => Promise<T>, ctx: ErrorContext): ResultAsync<T, EditorError> =>
    ResultAsync.fromPromise(call(), (cause) => {
      const { error, diagnostic } = translateApiError(cause, ctx);
      onDiagnostic?.(diagnostic);
      return error;
    });

  /** Second half of create/update: fetch the boundary the record points to and assemble the feature. */
  const loadFeature = (record: FeatureRecord, ctx: Pick<ErrorContext, "operation">): ResultAsync<AreaFeature, EditorError> =>
    run(() => api.get("/boundaries/{id}", { path: { id: record.boundaryId } }), {
      ...ctx,
      step: "load-boundary",
      featureId: record.id,
    }).andThen((boundary) =>
      boundary.id !== record.boundaryId
        ? err(invalidResponse("boundary"))
        : fromApiGeometry(boundary.geometry).andThen((geometry) => toAreaFeature(record, geometry)),
    );

  /**
   * A create is not atomic from the editor's point of view: the record exists once the POST
   * succeeds. If its geometry then cannot be loaded, leaving it behind would make a retry
   * create a duplicate, so the new record is removed again and the original failure is
   * reported. If even that fails, the error says so, with the orphan's id.
   */
  const rollbackCreate = (record: FeatureRecord, cause: EditorError): ResultAsync<AreaFeature, EditorError> =>
    ResultAsync.fromSafePromise(
      run(() => adapters[record.level].remove(record.id), { operation: "create", step: "rollback", featureId: record.id }).match(
        () => cause,
        (): EditorError =>
          applicationError(
            "operation_failed",
            `The ${record.level} was created but could not be loaded, and removing it failed. Reload before retrying to avoid a duplicate.`,
            record.id,
          ),
      ),
    ).andThen((error) => errAsync(error));

  return {
    create(request) {
      const input = parseRequest(createFeatureRequestSchema, request, "create request").andThen((parsed) =>
        toApiGeometry(parsed.geometry).map((geometry) => ({
          level: parsed.properties.level,
          name: parsed.properties.name,
          geometry,
          description: parsed.properties.description,
          status: parsed.properties.status,
        })),
      );
      if (input.isErr()) return errAsync(input.error);
      const { level, name, geometry, description, status } = input.value;

      return run(
        () =>
          adapters[level].create({
            name,
            geometry,
            ...(description !== undefined ? { description } : {}),
            ...(status !== undefined ? { status } : {}),
          }),
        { operation: "create", step: "write" },
      ).andThen((record) =>
        loadFeature(record, { operation: "create" }).orElse((cause) => rollbackCreate(record, cause)),
      );
    },

    update(request) {
      const input = parseRequest(updateFeatureRequestSchema, request, "update request").andThen((parsed) =>
        rejectExpectedVersion(parsed.id, parsed.expectedVersion)
          .andThen(() => resolveLevel(getFeatures(), parsed.id))
          .andThen((level) => toApiGeometry(parsed.geometry).map((geometry) => ({ level, geometry, id: parsed.id, name: parsed.properties?.name }))),
      );
      if (input.isErr()) return errAsync(input.error);
      const { level, id, geometry, name } = input.value;

      return run(
        () => adapters[level].update(id, { geometry, ...(name !== undefined ? { name } : {}) }),
        { operation: "update", step: "write", featureId: id },
      ).andThen((record) => loadFeature(record, { operation: "update" }));
    },

    remove(request) {
      const input = parseRequest(deleteFeatureRequestSchema, request, "delete request").andThen((parsed) =>
        rejectExpectedVersion(parsed.id, parsed.expectedVersion)
          .andThen(() => resolveLevel(getFeatures(), parsed.id))
          .map((level) => ({ level, id: parsed.id })),
      );
      if (input.isErr()) return errAsync(input.error);
      const { level, id } = input.value;

      return run(() => adapters[level].remove(id), { operation: "delete", step: "write", featureId: id }).map(() => ({ id }));
    },
  };
}
