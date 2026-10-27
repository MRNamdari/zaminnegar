'use server';

import type { CreateParcelDto, ParcelDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Creates a parcel. Geometry is validated by the API (PostGIS). */
export async function createParcelAction(projectId: string, body: CreateParcelDto): Promise<ActionResult<ParcelDto>> {
  return safeAction(() =>
    unwrapResponse(apiClient.POST('/api/v1/projects/{projectId}/parcels', { params: { path: { projectId: uuidSchema.parse(projectId) } }, body })),
  );
}
