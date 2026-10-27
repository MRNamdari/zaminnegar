'use server';

import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Deletes every parcel of a project. */
export async function deleteAllParcelsAction(projectId: string): Promise<ActionResult<undefined>> {
  return safeAction(() =>
    unwrapResponse(apiClient.DELETE('/api/v1/projects/{projectId}/parcels', { params: { path: { projectId: uuidSchema.parse(projectId) } } })),
  );
}
