'use server';

import type { ParcelDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Lists every parcel of a project. */
export async function listParcelsAction(projectId: string): Promise<ActionResult<ParcelDto[]>> {
  return safeAction(() =>
    unwrapResponse(apiClient.GET('/api/v1/projects/{projectId}/parcels', { params: { path: { projectId: uuidSchema.parse(projectId) } } })),
  );
}
