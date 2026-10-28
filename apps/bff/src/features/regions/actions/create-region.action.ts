'use server';

import type { RegionDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { createRegionSchema, type CreateRegionInput } from '../schemas/create-region.schema';

/** Creates a region from a GeoJSON MultiPolygon string. */
export async function createRegionAction(input: CreateRegionInput): Promise<ActionResult<RegionDto>> {
  return safeAction(async () => {
    const body = createRegionSchema.parse(input);
    return unwrapResponse(
      apiClient.POST('/api/v1/regions', {
        body: {
          name: body.name,
          description: body.description,
          territory: JSON.parse(body.territory) as any,
        },
      }),
    );
  });
}
