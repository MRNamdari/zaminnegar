'use server';

import type { ProjectListDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';

/** Lists the most recently changed projects (first 100). */
export async function listProjectsAction(): Promise<ActionResult<ProjectListDto>> {
  return safeAction(() => unwrapResponse(apiClient.GET('/api/v1/projects', { params: { query: { limit: 100, offset: 0 } } })));
}
