import 'server-only';

import {
  TanstackQueryApiClient,
  createApiClient,
  defaultFetcher,
  type Fetcher,
} from '@zaminnegar/api-client';
import { cookies } from 'next/headers';
import { API_CLIENT_OPTIONS } from './api';

/** Forwards the incoming request's cookies to the API, then lets the generated fetcher do the rest. */
const fetcher: Fetcher = {
  async fetch(input) {
    const cookie = (await cookies()).toString();
    const headers = new Headers(input.overrides?.headers);

    if (cookie) headers.set('cookie', cookie);

    return defaultFetcher({
      ...input,
      overrides: { ...input.overrides, headers },
    });
  },
};

let instance: TanstackQueryApiClient | undefined;

/**
 * Server API client (server components, server actions, route handlers).
 * Created on first use so a missing `NEST_API_URL` fails the request that needs it,
 * not `next build`.
 */
export function getServerApi(): TanstackQueryApiClient {
  if (!instance) {
    const baseUrl = process.env.NEST_API_URL;

    if (!baseUrl) throw new Error('NEST_API_URL is not configured');

    instance = new TanstackQueryApiClient(
      createApiClient(fetcher, baseUrl.replace(/\/+$/, ''), API_CLIENT_OPTIONS),
    );
  }

  return instance;
}
