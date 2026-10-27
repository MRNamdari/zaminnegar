import createClient, { type ClientOptions } from 'openapi-fetch';
import type { paths } from './generated/schema';

/**
 * Creates a fully typed client for the Zaminnegar API.
 *
 * Every path, parameter, request body and response is inferred from the OpenAPI
 * document, so a breaking API change turns into a compile error in the consumer.
 *
 * @param options - Base URL (the API origin, e.g. `http://localhost:3001`) and optional fetch overrides.
 * @example
 * const api = createApiClient({ baseUrl: 'http://localhost:3001' });
 * const { data } = await api.GET('/api/v1/projects', { params: { query: { limit: 20 } } });
 */
export function createApiClient(options: ClientOptions) {
  return createClient<paths>(options);
}

/** The concrete client type returned by {@link createApiClient}. */
export type ApiClient = ReturnType<typeof createApiClient>;
