'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { createRegionAction } from '../actions/create-region.action';
import { regionKeys } from '../query-keys';
import type { CreateRegionInput } from '../schemas/create-region.schema';

/** Creates a region and refreshes the dashboard list. */
export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRegionInput) => unwrapActionResult(await createRegionAction(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.all }),
  });
}
