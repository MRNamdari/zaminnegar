// bff/src/app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sessionCookieHeader } from '@/app/_lib/auth/session-cookie';

/**
 * Forwards `/api/*` to the Nest API (`NEST_API_URL`), so the browser only ever talks to this
 * origin. Method, query string and body pass through unchanged.
 *
 * Authentication is the Nest session cookie (HTTP-only, host-only, set by `POST /auth/login`):
 *  - requests: only that cookie is forwarded upstream, not the app's other cookies;
 *  - responses: every `Set-Cookie` is passed back untouched (login, rotation, logout, expiry).
 */

type Context = { params: Promise<{ path: string[] }> };

const HOP_BY_HOP = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

/**
 * `fetch` decodes the upstream body, so the encoding/length headers no longer describe it.
 * `cookie` is rebuilt below; the forwarding headers are set explicitly, never copied from the client.
 */
const REQUEST_STRIP = [
  ...HOP_BY_HOP,
  'host',
  'content-length',
  'accept-encoding',
  'cookie',
  'authorization',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
];
const RESPONSE_STRIP = [
  ...HOP_BY_HOP,
  'content-encoding',
  'content-length',
  'set-cookie', // re-added one by one, see below
];

const problem = (status: number, code: string, message: string) =>
  Response.json({ code, message }, { status });

/**
 * The API rate-limits OTP requests per client IP, so it must see the real client, not this server.
 * Only a value set by the platform/proxy in front of the BFF is trusted. If the BFF is exposed
 * directly, that proxy must overwrite these headers, otherwise a client can spoof its address.
 */
function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  return forwarded || request.headers.get('x-real-ip') || undefined;
}

async function proxy(request: NextRequest, { params }: Context) {
  const upstream = process.env.NEST_API_URL?.replace(/\/+$/, '');

  if (!upstream) {
    return problem(500, 'API_NOT_CONFIGURED', 'NEST_API_URL is not configured');
  }

  const { path } = await params;

  // `..` would let a request climb out of the API's base path.
  if (path.some((segment) => segment === '.' || segment === '..')) {
    return problem(400, 'INVALID_PATH', 'Invalid path');
  }

  const target = new URL(
    `${upstream}/${path.map(encodeURIComponent).join('/')}`,
  );
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const name of REQUEST_STRIP) headers.delete(name);

  const cookie = sessionCookieHeader(request.cookies.getAll());
  if (cookie) headers.set('cookie', cookie);

  // Forwarded as sent by the browser: the API checks it against TRUSTED_ORIGINS on state-changing requests.
  const ip = clientIp(request);
  if (ip) headers.set('x-forwarded-for', ip);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by Node's fetch when streaming a request body.
      ...(hasBody ? { duplex: 'half' } : {}),
      redirect: 'manual',
      cache: 'no-store',
      signal: request.signal,
    } as RequestInit);

    const responseHeaders = new Headers(response.headers);
    for (const name of RESPONSE_STRIP) responseHeaders.delete(name);
    // A `Headers` copy can fold several Set-Cookie values into one; append each separately.
    for (const setCookie of response.headers.getSetCookie()) {
      responseHeaders.append('set-cookie', setCookie);
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (cause) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 });

    console.error('[bff] API proxy failed:', cause);
    return problem(502, 'API_UNAVAILABLE', 'The API could not be reached');
  }
}

export {
  proxy as DELETE,
  proxy as GET,
  proxy as HEAD,
  proxy as OPTIONS,
  proxy as PATCH,
  proxy as POST,
  proxy as PUT,
};
