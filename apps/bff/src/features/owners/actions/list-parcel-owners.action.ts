'use server';

import type { ParcelOwnerDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Lists owners assigned to a parcel and their shares. */
export async function listParcelOwnersAction(parcelId: string): Promise<ActionResult<ParcelOwnerDto[]>> {
  return safeAction(() =>
    unwrapResponse(
      apiClient.GET('/api/v1/parcels/{parcelId}/owners', {
        params: { path: { parcelId: uuidSchema.parse(parcelId) }, query: { limit: 100, offset: 0 } },
      }),
    ),
  );
}
