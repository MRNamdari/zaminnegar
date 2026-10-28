'use server';

import type { ParcelOwnerDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';
import { assignParcelOwnerSchema, type AssignParcelOwnerInput } from '../schemas/assign-parcel-owner.schema';

/** Assigns an owner to a parcel with a share value in [0, 1]. */
export async function assignParcelOwnerAction(parcelId: string, input: AssignParcelOwnerInput): Promise<ActionResult<ParcelOwnerDto>> {
  return safeAction(async () => {
    const body = assignParcelOwnerSchema.parse(input);
    return unwrapResponse(
      apiClient.POST('/api/v1/parcels/{parcelId}/owners', {
        params: { path: { parcelId: uuidSchema.parse(parcelId) } },
        body: { ownerId: body.ownerId, share: body.share },
      }),
    );
  });
}
