'use server';

import { z } from 'zod';
import { env } from '@/config/env';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { ApiError } from '@/lib/api/api-error';
import { fa } from '@/messages/fa';
import { searchQuerySchema, type SearchQueryInput } from '../schemas/search-query.schema';
import type { Place } from '../types';

const nominatimResponseSchema = z.array(
  z.object({
    display_name: z.string(),
    lat: z.string(),
    lon: z.string(),
    boundingbox: z.tuple([z.string(), z.string(), z.string(), z.string()]).optional(), // [south, north, west, east]
  }),
);

/**
 * Looks a place up through Nominatim. Done on the server so the geocoder's usage policy
 * (identifying User-Agent) is respected and its URL stays configurable.
 */
export async function searchPlacesAction(input: SearchQueryInput): Promise<ActionResult<Place[]>> {
  return safeAction(async () => {
    const { query } = searchQuerySchema.parse(input);
    const url = `${env.GEOCODER_URL}/search?format=jsonv2&limit=6&accept-language=fa&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': env.GEOCODER_USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    }).catch(() => null);
    if (!response?.ok) throw new ApiError(502, 'GEOCODER_UNAVAILABLE', fa.search.failed);

    return nominatimResponseSchema.parse(await response.json()).map((item): Place => {
      const [south, north, west, east] = (item.boundingbox ?? []).map(Number);
      const hasBox = [south, north, west, east].every(Number.isFinite);
      return { name: item.display_name, lon: Number(item.lon), lat: Number(item.lat), bbox: hasBox ? [west, south, east, north] : null };
    });
  });
}
