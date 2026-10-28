'use server';

import type { BlockListDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { uuidSchema } from '@/lib/validation/uuid-schema';

/** Lists blocks inside a region. */
export async function listBlocksAction(regionId: string): Promise<ActionResult<BlockListDto>> {
  return safeAction(() =>
    unwrapResponse(
      apiClient.GET('/api/v1/regions/{regionId}/blocks', {
        params: { path: { regionId: uuidSchema.parse(regionId) }, query: { limit: 100, offset: 0 } },
      }),
    ),
  );
}
