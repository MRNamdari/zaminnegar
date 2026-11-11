'use client';

import {
  QueryClient,
  QueryClientProvider,
  environmentManager,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

let browserClient: QueryClient | undefined;

/** A fresh client per server render (no cross-request leaks); one shared client in the browser. */
const getQueryClient = () =>
  environmentManager.isServer()
    ? makeQueryClient()
    : (browserClient ??= makeQueryClient());

export function QueryProviders({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
