import 'server-only';

import {
  TanstackQueryApiClient,
  createApiClient,
  defaultFetcher,
  type Fetcher,
} from '@zaminnegar/api-client';
import { cookies } from 'next/headers';
import { API_CLIENT_OPTIONS } from './api';
import { sessionCookieHeader } from './auth/session-cookie';
import { applySetCookies } from './auth/set-cookie';

/**
 * Session cookie in, session cookie out:
 *  - forwards the incoming request's session cookie (and only that) to the API;
 *  - copies the API's `Set-Cookie` (login, logout, rotation) onto the response to the browser.
 *    Without this a server-side login succeeds but the browser never receives the session.
 */
const fetcher: Fetcher = {
  async fetch(input) {
    const cookie = sessionCookieHeader((await cookies()).getAll());
    const headers = new Headers(input.overrides?.headers);

    if (cookie) headers.set('cookie', cookie);

    const response = await defaultFetcher({
      ...input,
      overrides: { ...input.overrides, headers },
    });

    await applySetCookies(response);

    return response;
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
