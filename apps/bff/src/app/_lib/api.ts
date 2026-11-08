import { ResultAsync, err, ok, type Result } from 'neverthrow';
import type { z } from 'zod';
import {
  applicationError,
  areaCollectionSchema,
  areaFeatureSchema,
  networkError,
  parseResponse,
  type AreaCollection,
  type AreaFeature,
  type EditorError,
  type FeatureGateway,
} from '@/app/features/map-editor';
import { createApiClient } from '@zaminnegar/api-client';

export const api = createApiClient({ baseUrl: 'https://localhost:3001/' });

/**
 * Example NestJS transport. This is *application* code: the map editor only sees
 * the `FeatureGateway` contract, never URLs or fetch.
 */
// Defaults to the demo route handlers in `app/api`. Set NEXT_PUBLIC_API_URL to point at a real backend (e.g. NestJS).
const baseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === 'undefined'
    ? `http://localhost:${process.env.PORT ?? 3000}/api`
    : '/api');

const toNetworkError = (cause: unknown): EditorError =>
  cause instanceof DOMException && cause.name === 'AbortError'
    ? networkError('timeout', 'The request was aborted')
    : networkError('offline', 'The backend could not be reached');

function statusToError(status: number): EditorError {
  if (status === 409)
    return applicationError(
      'conflict',
      'The feature was changed by someone else',
    );
  if (status === 403)
    return applicationError('rejected', 'The backend rejected this operation');
  return networkError('http', `Backend responded with ${status}`, {
    status,
    retryable: status >= 500,
  });
}

function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: RequestInit,
): ResultAsync<z.output<S>, EditorError> {
  const send = ResultAsync.fromPromise(
    fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    }),
    toNetworkError,
  );

  return send
    .andThen((response) => {
      const failure: Result<Response, EditorError> = response.ok
        ? ok(response)
        : err(statusToError(response.status));
      return failure;
    })
    .andThen((response) =>
      ResultAsync.fromPromise(
        response.json() as Promise<unknown>,
        (): EditorError =>
          networkError('invalid_response', 'Backend returned malformed JSON'),
      ),
    )
    .andThen((payload) => parseResponse(schema, payload, path));
}

export const fetchFeatures = (
  signal?: AbortSignal,
): ResultAsync<AreaCollection, EditorError> =>
  request('/features', areaCollectionSchema, { signal });

const send = (
  path: string,
  method: string,
  body?: unknown,
): ResultAsync<AreaFeature, EditorError> =>
  request(path, areaFeatureSchema, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

export const featureGateway: FeatureGateway = {
  create: (body) => send('/features', 'POST', body),
  update: (body) =>
    send(`/features/${encodeURIComponent(body.id)}`, 'PUT', body),
  remove: ({ id, expectedVersion }) => {
    const query =
      expectedVersion !== undefined
        ? `?expectedVersion=${expectedVersion}`
        : '';
    return ResultAsync.fromPromise(
      fetch(`${baseUrl()}/features/${encodeURIComponent(id)}${query}`, {
        method: 'DELETE',
      }),
      toNetworkError,
    ).andThen((response) =>
      response.ok ? ok({ id }) : err(statusToError(response.status)),
    );
  },
};
