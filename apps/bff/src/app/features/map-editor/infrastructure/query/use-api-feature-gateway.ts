"use client";

import { useEffect, useMemo, useRef } from "react";
import { createFeatureGateway, type ApiFeatureClient, type FeatureGatewayOptions } from "../api/feature-gateway";
import type { FeatureGateway } from "./use-feature-operations";

/**
 * A stable `FeatureGateway` for `api`, so `useFeatureOperations` does not rebuild its operations on every render.
 * It is rebuilt only when `api` changes; the latest `onDiagnostic` is read at call time, so an inline callback is fine.
 */
export function useApiFeatureGateway(
  api: ApiFeatureClient,
  options: Pick<FeatureGatewayOptions, "onDiagnostic"> = {},
): FeatureGateway {
  const onDiagnostic = useRef(options.onDiagnostic);
  useEffect(() => {
    onDiagnostic.current = options.onDiagnostic;
  });

  return useMemo(
    () => createFeatureGateway({ api, onDiagnostic: (diagnostic) => onDiagnostic.current?.(diagnostic) }),
    [api],
  );
}
