'use server';

import type { ParcelDto, UpdateParcelDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Partially updates a parcel (properties and/or geometry). */
export async function updateParcelAction(projectId: string, parcelId: string, body: UpdateParcelDto): Promise<ActionResult<ParcelDto>> {
  return safeAction(() =>
    unwrapResponse(
      apiClient.PATCH('/api/v1/projects/{projectId}/parcels/{parcelId}', {
        params: { path: { projectId: uuidSchema.parse(projectId), parcelId: uuidSchema.parse(parcelId) } },
        body,
      }),
    ),
  );
}
