import type { NextRequest } from 'next/server';

/**
 * Forwards `/api/*` to the Nest API (`NEST_API_URL`), so the browser only ever talks to this
 * origin. Method, query string, body and cookies pass through unchanged; `Set-Cookie` comes back.
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

/** `fetch` decodes the upstream body, so the encoding/length headers no longer describe it. */
const REQUEST_STRIP = [
  ...HOP_BY_HOP,
  'host',
  'content-length',
  'accept-encoding',
];
const RESPONSE_STRIP = [...HOP_BY_HOP, 'content-encoding', 'content-length'];

const problem = (status: number, code: string, message: string) =>
  Response.json({ code, message }, { status });

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

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (cause) {
    if (request.signal.aborted) return new Response(null, { status: 499 });

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
