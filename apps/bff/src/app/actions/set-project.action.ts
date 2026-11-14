'use server';

import { SetActiveProjectDto } from '@zaminnegar/api-client';
import { getServerApi } from '../_lib/api.server';

export async function setProject({ projectId }: SetActiveProjectDto) {
  const response = await getServerApi().client.put('/auth/session/project', {
    body: { projectId },
  });

  return response
}
