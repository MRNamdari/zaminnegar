import 'server-only';
import { createApiClient } from '@zaminnegar/api-client';
import { env } from '@/config/env';

/** Shared, fully typed client for @zaminnegar/api. Server-side only. */
export const apiClient = createApiClient({ baseUrl: env.API_BASE_URL });
