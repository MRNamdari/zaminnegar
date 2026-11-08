import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxy(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;

  const backendUrl = new URL(
    `/${path.map(encodeURIComponent).join('/')}`,
    BACKEND_URL,
  );

  backendUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);

  // Remove headers that should not be forwarded.
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: 'manual',
    cache: 'no-store',
  });

  const responseHeaders = new Headers(response.headers);

  // Remove hop-by-hop headers.
  responseHeaders.delete('connection');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('x-powered-by');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
