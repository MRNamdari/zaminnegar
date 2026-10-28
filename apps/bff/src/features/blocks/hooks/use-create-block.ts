'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { createBlockAction } from '../actions/create-block.action';
import { blockKeys } from '../query-keys';
import type { CreateBlockInput } from '../schemas/create-block.schema';

/** Creates a block and refreshes the region's block list. */
export function useCreateBlock(regionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBlockInput) => unwrapActionResult(await createBlockAction(regionId, input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: blockKeys.all }),
  });
}
