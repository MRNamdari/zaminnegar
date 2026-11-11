export * from './generated/client.ts';

export {
  TanstackQueryApiClient,
  queryKeyFactory,
  invalidateEndpoint,
} from './generated/tanstack.ts';

export type {} from // Add the TanStack-specific types you actually need here.
'./generated/tanstack.ts';

export { createApi, defaultFetcher } from './generated/api.client.ts';
