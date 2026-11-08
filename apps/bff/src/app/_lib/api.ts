import { createApiClient } from '@zaminnegar/api-client';

/**
 * The one typed API client for the BFF.
 *
 * - On the server it talks to the API directly (`API_URL`, default `http://localhost:3001`).
 * - In the browser it uses the BFF's own origin; `next.config.ts` rewrites `/api/*` to the API,
 *   so the API needs no CORS setup and its address never reaches the client bundle.
 */
const baseUrl =
  typeof window === 'undefined'
    ? 'http://localhost:3000/api'
    : 'http://localhost:3000/api';

console.log('API client base URL:', baseUrl);

export const api = createApiClient({ baseUrl });
