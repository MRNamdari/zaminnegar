'use server';

import type { ParcelFeatureCollectionDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Fetches the project's parcels as an RFC 7946 GeoJSON FeatureCollection. */
export async function exportGeoJsonAction(projectId: string): Promise<ActionResult<ParcelFeatureCollectionDto>> {
  return safeAction(() =>
    unwrapResponse(apiClient.GET('/api/v1/projects/{projectId}/exports/geojson', { params: { path: { projectId: uuidSchema.parse(projectId) } } })),
  );
}
