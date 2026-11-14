import type { ValidateSide } from '@zaminnegar/api-client';

/**
 * Shared configuration for the two API clients. This file holds no client of its own:
 * `api.server.ts` is `server-only`, so the browser and server clients cannot live together.
 *
 * - Browser: `api.client.ts` calls `/api/*` on the BFF origin and
 *   `app/api/[...path]/route.ts` forwards it to the Nest API. The API's address never
 *   reaches the client bundle and the API needs no CORS setup.
 * - Server: `api.server.ts` calls `NEST_API_URL` directly and forwards the request cookies.
 */
export const API_PROXY_PREFIX = 'api';

/**
 * Generated-schema validation is switched off on purpose. With it on:
 *
 * - every list endpoint throws ("Unmergable intersection": the paginated envelope and its
 *   typed `items` cannot be merged once dates are transformed);
 * - single-entity responses turn `createdAt`/`updatedAt` into `Date`s;
 * - PATCH bodies gain schema defaults, e.g. `{ name }` is sent as `{ name, description: '' }`
 *   and silently wipes the description.
 *
 * Responses are validated where they are consumed (see `feature-gateway.ts`). Note that the
 * generated *types* still say `Date` for timestamps; at runtime they are ISO strings.
 */
export const API_CLIENT_OPTIONS: { validate: ValidateSide } = {
  validate: 'none',
};
