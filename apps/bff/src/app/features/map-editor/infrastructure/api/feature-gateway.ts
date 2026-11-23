import type { ApiClient, MapFeatureResponseDto } from "@zaminnegar/api-client";
import { err, errAsync, ok, ResultAsync, type Result } from "neverthrow";
import type { z } from "zod";
import { applicationError, issuesFromZod, validationError, type EditorError } from "../../core/errors";
import {
  areaFeatureSchema,
  createFeatureRequestSchema,
  deleteFeatureRequestSchema,
  updateFeatureRequestSchema,
  type AreaFeature,
} from "../../core/schemas";
import type { FeatureGateway } from "../query/use-feature-operations";
import { invalidResponse, translateApiError, type GatewayDiagnostic } from "./error-translation";

/**
 * Feature gateway: the editor's domain on one side, the generated `@zaminnegar/api-client` on the other.
 * Independent of React and TanStack Query.
 *
 * The backend's map module (`/map/features`) is shaped for this editor, so each operation is one request:
 *  - `POST /map/features`       creates a region, block or parcel; the body names its `level`.
 *  - `PATCH /map/features/{id}` changes one; the backend finds the level from the id.
 *  - `DELETE /map/features/{id}`
 * Create and update answer with the same GeoJSON feature `GET /map/features` lists, geometry and the values the
 * database derives (area, parent) included, so there is nothing to assemble, look up or roll back here.
 *
 * The project comes from the session, so no `projectId` is sent. Block and parcel parentage is derived by the
 * database, so no `parentId` is sent.
 *
 * **No optimistic concurrency.** No endpoint accepts or returns a version. A request carrying `expectedVersion` is
 * therefore rejected rather than silently applied without the guarantee it asked for; writes are last-write-wins.
 */

/** The subset of the generated client the gateway uses; the real `ApiClient` satisfies it. */
export type ApiFeatureClient = Pick<ApiClient, "post" | "patch" | "delete">;

export type FeatureGatewayOptions = {
  api: ApiFeatureClient;
  /** Receives backend detail (status, code, raw message, original error) that is not shown to users. */
  onDiagnostic?: (diagnostic: GatewayDiagnostic) => void;
};

function parseRequest<S extends z.ZodType>(
  schema: S,
  request: unknown,
  subject: "create" | "update" | "delete",
): Result<z.output<S>, EditorError> {
  const parsed = schema.safeParse(request);
  if (parsed.success) return ok(parsed.data);
  return err(validationError("invalid_schema", { subject, issues: issuesFromZod(parsed.error) }));
}

function rejectExpectedVersion(id: string, expectedVersion: number | undefined): Result<void, EditorError> {
  if (expectedVersion === undefined) return ok(undefined);
  return err(applicationError("rejected", { reason: "version_unsupported", featureId: id }));
}

/** The backend's answer, checked against the editor's own feature shape. */
function toFeature(response: MapFeatureResponseDto): Result<AreaFeature, EditorError> {
  const parsed = areaFeatureSchema.safeParse(response);
  return parsed.success ? ok(parsed.data) : err(invalidResponse());
}

export function createFeatureGateway({ api, onDiagnostic }: FeatureGatewayOptions): FeatureGateway {
  /** Runs one backend call; every failure is translated and reported exactly once. */
  const run = <T>(call: () => Promise<T>, ctx: Parameters<typeof translateApiError>[1]): ResultAsync<T, EditorError> =>
    ResultAsync.fromPromise(call(), (cause) => {
      const { error, diagnostic } = translateApiError(cause, ctx);
      onDiagnostic?.(diagnostic);
      return error;
    });

  return {
    create(request) {
      const input = parseRequest(createFeatureRequestSchema, request, "create");
      if (input.isErr()) return errAsync(input.error);
      const { geometry, properties } = input.value;
      const { level, name, description, status } = properties;

      return run(
        () =>
          api.post("/map/features", {
            body: {
              level,
              name,
              geometry,
              ...(description !== undefined ? { description } : {}),
              ...(status !== undefined ? { status } : {}),
            },
          }),
        { operation: "create" },
      ).andThen(toFeature);
    },

    update(request) {
      const input = parseRequest(updateFeatureRequestSchema, request, "update").andThen((parsed) =>
        rejectExpectedVersion(parsed.id, parsed.expectedVersion).map(() => parsed),
      );
      if (input.isErr()) return errAsync(input.error);
      const { id, geometry, properties } = input.value;
      const name = properties?.name;

      return run(
        () =>
          api.patch("/map/features/{id}", {
            path: { id },
            body: { geometry, ...(name !== undefined ? { name } : {}) },
          }),
        { operation: "update", featureId: id },
      ).andThen(toFeature);
    },

    remove(request) {
      const input = parseRequest(deleteFeatureRequestSchema, request, "delete").andThen((parsed) =>
        rejectExpectedVersion(parsed.id, parsed.expectedVersion).map(() => parsed),
      );
      if (input.isErr()) return errAsync(input.error);
      const { id } = input.value;

      return run(() => api.delete("/map/features/{id}", { path: { id } }), { operation: "delete", featureId: id }).map(() => ({ id }));
    },
  };
}
