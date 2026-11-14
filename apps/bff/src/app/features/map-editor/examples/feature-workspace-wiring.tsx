/**
 * Application wiring (lives in the host app, not in the map-editor package).
 * Everything the editor needs is imported from the package's public entry point;
 * adjust the "@zaminnegar/map-editor" specifier to however the app resolves it.
 */
'use client';

import {
  createApiClient,
  defaultFetcher,
  type ApiClient,
} from '@zaminnegar/api-client';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query';

import { useState, type ReactNode } from 'react';
import { MapEditor } from '..';
import { AreaCollection } from '../core/schemas';
import { GatewayDiagnostic } from '../infrastructure/api/error-translation';
import { useApiFeatureGateway } from '../infrastructure/query/use-api-feature-gateway';
import { useFeatureOperations } from '../infrastructure/query/use-feature-operations';
import { FeatureWorkspaceProvider } from '../react/FeatureWorkspaceProvider';

/* 1. Create the API client once, outside React rendering. */
// The session is an HTTP-only cookie, so the browser must be told to send it.
export const api: ApiClient = createApiClient(
  {
    fetch: (input) =>
      defaultFetcher({
        ...input,
        overrides: { credentials: 'include', ...input.overrides },
      }),
  },
  process.env.NEXT_PUBLIC_API_URL,
);

/* 2. The canonical feature collection has exactly one query key. */
export const featuresQueryKey = [
  'map-editor',
  'features',
] as const satisfies QueryKey;

const logDiagnostic = (d: GatewayDiagnostic): void =>
  console.warn('[features-api]', d);

/** 3. One QueryClient for the app's lifetime (created lazily per browser session, never per render). */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function FeatureMap() {
  // Loads the canonical collection. Any loader works as long as it fills `featuresQueryKey`
  // with an `AreaCollection`; map the API's list endpoints to it in your own queryFn.
  const { data: features } = useQuery<AreaCollection>({
    queryKey: featuresQueryKey,
    queryFn: loadFeatureCollection,
  });

  // 4. Gateway (stable; reads the level of existing features from the same cache entry)...
  const gateway = useApiFeatureGateway(api, featuresQueryKey, {
    onDiagnostic: logDiagnostic,
  });
  // 5. ...and the editor's operations, which also write confirmed results back to that cache.
  const operations = useFeatureOperations(gateway, featuresQueryKey);

  if (!features) return null;
  return (
    <FeatureWorkspaceProvider value={{ features }} operations={operations}>
      <MapEditor />
    </FeatureWorkspaceProvider>
  );
}

declare function loadFeatureCollection(): Promise<AreaCollection>;
