"use client";

import { matchQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ResultAsync } from "neverthrow";
import type { EditorError } from "../../core/errors";
import type { FeatureOperations } from "../../core/operations";
import type { AreaCollection, AreaFeature, CreateFeatureRequest, DeleteFeatureRequest, UpdateFeatureRequest } from "../../core/schemas";
import { removeFeature, upsertFeature } from "./feature-cache";
import { fromPromise, toPromise } from "./result-adapters";

/** The application's transport. Implement with fetch, a generated client, tRPC, etc. */
export interface FeatureGateway {
  create(request: CreateFeatureRequest): ResultAsync<AreaFeature, EditorError>;
  update(request: UpdateFeatureRequest): ResultAsync<AreaFeature, EditorError>;
  remove(request: DeleteFeatureRequest): ResultAsync<{ id: string }, EditorError>;
}

export type FeatureOperationsOptions = {
  /**
   * What to invalidate after a successful create, update or delete.
   *  - `'all'` (default): every query in the `QueryClient`. A feature change moves area, statistics and parent-child
   *    relations that other queries (lists, statistics, project data) may show, so none of them is trusted afterwards.
   *  - a list of query keys: only the queries under those keys (plus the features query, always).
   */
  invalidate?: "all" | readonly QueryKey[];
};

/**
 * Builds `FeatureOperations` from TanStack Query mutations.
 *
 * On success the cache is first patched with the backend's canonical feature, so the map updates at once, and
 * then invalidated so everything is fetched again. The backend derives area, statistics and parent-child relations
 * from geometry, so a create, update or delete can change features other than the one it returns (a parent's area,
 * its children's `parentId`), and only a refetch brings those back in line.
 *
 * Invalidation, not removal: the queries are marked stale and the active ones refetch immediately, but their
 * current data stays until fresh data arrives. Removing or resetting the cache would empty the controlled
 * `features` for a moment, and the editor would then clear every feature from the map and lose the selection.
 *
 * The operation settles once the features query has been refetched, so callers never observe a half-refreshed map.
 * Other invalidated queries refetch in the background and are not waited for, so a slow unrelated query cannot
 * hold up "saving". A failed refetch does not fail the operation (it is already saved); the query keeps its data.
 * Failed mutations touch nothing, so no user geometry is lost.
 */
export function useFeatureOperations(
  gateway: FeatureGateway,
  queryKey: QueryKey,
  { invalidate = "all" }: FeatureOperationsOptions = {},
): FeatureOperations {
  const queryClient = useQueryClient();

  const patchCache = (fn: (collection: AreaCollection) => AreaCollection) =>
    queryClient.setQueryData<AreaCollection>(queryKey, (current) => (current ? fn(current) : current));

  /** Invalidates the other queries in the background and the features query awaited (one refetch of it, not two). */
  const refresh = async (): Promise<void> => {
    void queryClient.invalidateQueries({
      predicate: (query) =>
        !matchQuery({ queryKey }, query) &&
        (invalidate === "all" || invalidate.some((key) => matchQuery({ queryKey: key }, query))),
    });
    await queryClient.invalidateQueries({ queryKey });
  };

  const create = useMutation({
    mutationFn: (request: CreateFeatureRequest) => toPromise(gateway.create(request)),
    onSuccess: async (feature) => {
      patchCache((c) => upsertFeature(c, feature));
      await refresh();
    },
  });
  const update = useMutation({
    mutationFn: (request: UpdateFeatureRequest) => toPromise(gateway.update(request)),
    onSuccess: async (feature) => {
      patchCache((c) => upsertFeature(c, feature));
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (request: DeleteFeatureRequest) => toPromise(gateway.remove(request)),
    onSuccess: async ({ id }) => {
      patchCache((c) => removeFeature(c, id));
      await refresh();
    },
  });

  const { mutateAsync: createAsync } = create;
  const { mutateAsync: updateAsync } = update;
  const { mutateAsync: removeAsync } = remove;

  return useMemo<FeatureOperations>(
    () => ({
      createFeature: (request) => fromPromise(createAsync(request)),
      updateFeature: (request) => fromPromise(updateAsync(request)),
      deleteFeature: (request) => fromPromise(removeAsync(request)),
    }),
    [createAsync, updateAsync, removeAsync],
  );
}
