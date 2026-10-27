'use server';

import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Deletes one parcel. */
export async function deleteParcelAction(projectId: string, parcelId: string): Promise<ActionResult<undefined>> {
  return safeAction(() =>
    unwrapResponse(
      apiClient.DELETE('/api/v1/projects/{projectId}/parcels/{parcelId}', {
        params: { path: { projectId: uuidSchema.parse(projectId), parcelId: uuidSchema.parse(parcelId) } },
      }),
    ),
  );
}
