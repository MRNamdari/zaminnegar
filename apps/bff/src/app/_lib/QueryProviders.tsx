'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { TypedStatusError } from '@zaminnegar/api-client';
import { useState, type ReactNode } from 'react';

const handleUnauthorized = (error: unknown) => {
  if (
    error instanceof TypedStatusError &&
    error.status === 401 &&
    window.location.pathname !== '/login'
  ) {
    window.location.replace('/login');
  }
};

const makeQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: handleUnauthorized,
    }),

    mutationCache: new MutationCache({
      onError: handleUnauthorized,
    }),

    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

let browserClient: QueryClient | undefined;

/** A fresh client per server render; one shared client in the browser. */
const getQueryClient = () =>
  typeof window === 'undefined'
    ? makeQueryClient()
    : (browserClient ??= makeQueryClient());

export function QueryProviders({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
