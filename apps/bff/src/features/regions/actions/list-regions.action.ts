'use server';

import type { RegionListDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';

/** Lists the most recently changed regions. */
export async function listRegionsAction(): Promise<ActionResult<RegionListDto>> {
  return safeAction(() => unwrapResponse(apiClient.GET('/api/v1/regions', { params: { query: { limit: 100, offset: 0 } } })));
}
