"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
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

/**
 * Builds `FeatureOperations` from TanStack Query mutations. On success the cache is
 * updated with the backend's canonical feature, which flows down through the controlled
 * workspace to the map. Failed mutations touch nothing, so no user geometry is lost.
 * Call `queryClient.invalidateQueries` yourself if you also want a refetch.
 */
export function useFeatureOperations(gateway: FeatureGateway, queryKey: QueryKey): FeatureOperations {
  const queryClient = useQueryClient();

  const patchCache = (fn: (collection: AreaCollection) => AreaCollection) =>
    queryClient.setQueryData<AreaCollection>(queryKey, (current) => (current ? fn(current) : current));

  const create = useMutation({
    mutationFn: (request: CreateFeatureRequest) => toPromise(gateway.create(request)),
    onSuccess: (feature) => patchCache((c) => upsertFeature(c, feature)),
  });
  const update = useMutation({
    mutationFn: (request: UpdateFeatureRequest) => toPromise(gateway.update(request)),
    onSuccess: (feature) => patchCache((c) => upsertFeature(c, feature)),
  });
  const remove = useMutation({
    mutationFn: (request: DeleteFeatureRequest) => toPromise(gateway.remove(request)),
    onSuccess: ({ id }) => patchCache((c) => removeFeature(c, id)),
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
