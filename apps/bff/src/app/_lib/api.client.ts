import {
  TanstackQueryApiClient,
  createApiClient,
  defaultFetcher,
} from '@zaminnegar/api-client';
import { API_CLIENT_OPTIONS, API_PROXY_PREFIX } from './api';

/**
 * Browser API client. Requests go to this app's own `/api/*`, which the route handler
 * proxies to the Nest API. The generated client builds absolute URLs, hence the origin.
 *
 * On the server this module is only evaluated while rendering client components; no request
 * is made from there (queries run in the browser), so the fallback origin is never called.
 */
const origin =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    : window.location.origin;

export const api = new TanstackQueryApiClient(
  createApiClient(
    { fetch: defaultFetcher },
    `${origin}/${API_PROXY_PREFIX}`,
    API_CLIENT_OPTIONS,
  ),
);
