"use client";

import { hashKey, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import type { AreaCollection } from "../../core/schemas";
import { createFeatureGateway, type ApiFeatureClient, type FeatureGatewayOptions } from "../api/feature-gateway";
import type { FeatureGateway } from "./use-feature-operations";

/**
 * Binds `createFeatureGateway` to the TanStack Query cache.
 *
 * Pass the same `queryKey` you give `useFeatureOperations`: that key identifies the one
 * canonical collection used for level lookup here and for cache updates there. The
 * hook does not write to the cache itself; `useFeatureOperations` does, after success.
 *
 * The returned gateway is stable across renders. It is rebuilt only when `api`, the
 * `QueryClient` or the *content* of the key (by TanStack's key hash, so an inline array
 * literal is fine) changes. Latest `queryKey` / `onDiagnostic` are read at call time.
 */
export function useApiFeatureGateway(
  api: ApiFeatureClient,
  queryKey: QueryKey,
  options: Pick<FeatureGatewayOptions, "onDiagnostic"> = {},
): FeatureGateway {
  const queryClient = useQueryClient();
  const keyHash = hashKey(queryKey);

  const latest = useRef({ queryKey, onDiagnostic: options.onDiagnostic });
  useEffect(() => {
    latest.current = { queryKey, onDiagnostic: options.onDiagnostic };
  });

  return useMemo(
    () =>
      createFeatureGateway({
        api,
        getFeatures: () => queryClient.getQueryData<AreaCollection>(latest.current.queryKey),
        onDiagnostic: (diagnostic) => latest.current.onDiagnostic?.(diagnostic),
      }),
    // `keyHash` stands in for `queryKey`: equal hashes are the same cache entry.
    [api, queryClient, keyHash],
  );
}
