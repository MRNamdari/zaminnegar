"use client";
import {
  QueryClient,
  QueryClientProvider,
  environmentManager,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

let browserClient: QueryClient | undefined;
const getQueryClient = () =>
  environmentManager.isServer()
    ? makeQueryClient()
    : (browserClient ??= makeQueryClient());

export function QueryProviders({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
