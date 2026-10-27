'use server';

import type { ProjectDto } from '@zaminnegar/api-client';
import type { ActionResult } from '@/lib/actions/action-result';
import { safeAction } from '@/lib/actions/safe-action';
import { apiClient } from '@/lib/api/api-client';
import { unwrapResponse } from '@/lib/api/unwrap-response';
import { createProjectSchema, type CreateProjectInput } from '../schemas/create-project.schema';

/** Creates a project. The input is re-validated on the server. */
export async function createProjectAction(input: CreateProjectInput): Promise<ActionResult<ProjectDto>> {
  return safeAction(async () => {
    const body = createProjectSchema.parse(input);
    return unwrapResponse(apiClient.POST('/api/v1/projects', { body }));
  });
}
