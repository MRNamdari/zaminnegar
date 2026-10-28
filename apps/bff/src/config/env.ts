import 'server-only';
import { loadEnvConfig } from '@next/env';
import { z } from 'zod';

/** Every server-side setting the BFF understands, with defaults suitable for local development. */
const envSchema = z.object({
  API_BASE_URL: z.url().default('http://localhost:3001'),
  MAP_IMAGERY_PROVIDER: z.enum(['esri', 'mapbox', 'maptiler']).default('esri'),
  MAPBOX_TOKEN: z.string().optional(),
  MAPTILER_KEY: z.string().optional(),
  MAP_DEFAULT_CENTER: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'expected "longitude,latitude"')
    .default('59.680400, 36.214805'),
  MAP_DEFAULT_ZOOM: z.coerce.number().min(0).max(22).default(13.5),
  GEOCODER_URL: z.url().default('https://nominatim.openstreetmap.org'),
  GEOCODER_USER_AGENT: z.string().default('zaminnegar-bff/1.0'),
});

/** Type-safe, validated configuration. Read settings from here, never from `process.env`. */
export const env = envSchema.parse(loadEnvConfig(process.cwd()).combinedEnv);
