'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { createProjectAction } from '../actions/create-project.action';
import { projectKeys } from '../query-keys';
import type { CreateProjectInput } from '../schemas/create-project.schema';

/** Creates a project and refreshes the project list. */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => unwrapActionResult(await createProjectAction(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
