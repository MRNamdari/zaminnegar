'use server';

import type { OwnerListDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';

/** Lists owners. */
export async function listOwnersAction(): Promise<ActionResult<OwnerListDto>> {
  return safeAction(() => unwrapResponse(apiClient.GET('/api/v1/owners', { params: { query: { limit: 100, offset: 0 } } })));
}
