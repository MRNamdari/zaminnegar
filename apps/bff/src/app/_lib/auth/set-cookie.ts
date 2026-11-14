import 'server-only';

import type { FetcherResponse } from '@zaminnegar/api-client';
import { cookies } from 'next/headers';
import { sessionCookieNames } from './session-cookie';

type SameSite = 'lax' | 'strict' | 'none';

interface ParsedSetCookie {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSite;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
}

/** Parses one `Set-Cookie` header value (RFC 6265 attributes). */
export function parseSetCookie(header: string): ParsedSetCookie | null {
  const [pair = '', ...attributes] = header.split(';').map((part) => part.trim());
  const separator = pair.indexOf('=');

  if (separator <= 0) return null;

  let value = pair.slice(separator + 1);

  try {
    value = decodeURIComponent(value);
  } catch {
    // keep the raw value
  }

  const cookie: ParsedSetCookie = { name: pair.slice(0, separator), value };

  for (const attribute of attributes) {
    const eq = attribute.indexOf('=');
    const key = (eq < 0 ? attribute : attribute.slice(0, eq)).toLowerCase();
    const raw = eq < 0 ? '' : attribute.slice(eq + 1);

    switch (key) {
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'path':
        cookie.path = raw;
        break;
      case 'domain':
        cookie.domain = raw;
        break;
      case 'max-age': {
        const seconds = Number(raw);
        if (Number.isFinite(seconds)) cookie.maxAge = seconds;
        break;
      }
      case 'expires': {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) cookie.expires = date;
        break;
      }
      case 'samesite': {
        const mode = raw.toLowerCase();
        if (mode === 'lax' || mode === 'strict' || mode === 'none') {
          cookie.sameSite = mode;
        }
        break;
      }
    }
  }

  return cookie;
}

/**
 * Writes the API's session cookie to the browser. A server-side `fetch` to the API does not do that by
 * itself: the `Set-Cookie` header stops at this server unless it is copied onto the outgoing response.
 *
 * - Only the session cookie is accepted; the API cannot set other cookies on this origin.
 * - Next allows setting cookies in Server Actions and Route Handlers, not while rendering Server
 *   Components. There the new cookie is dropped (and a warning is logged).
 */
export async function applySetCookies(
  response: Pick<FetcherResponse, 'headers'>,
): Promise<void> {
  const headers = response.headers.getSetCookie?.() ?? [];

  if (headers.length === 0) return;

  const names = sessionCookieNames();
  const store = await cookies();

  for (const header of headers) {
    const parsed = parseSetCookie(header);

    if (!parsed || !names.includes(parsed.name)) continue;

    const { name, value, ...options } = parsed;

    try {
      store.set(name, value, options);
    } catch {
      console.warn(
        `[bff] The API sent a new "${name}" cookie while rendering a Server Component; Next cannot store it. ` +
          'See the session rotation note: raise SESSION_ROTATION_INTERVAL_SECONDS on the API.',
      );
    }
  }
}
