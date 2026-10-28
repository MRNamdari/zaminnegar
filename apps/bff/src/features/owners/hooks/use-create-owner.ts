'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { createOwnerAction } from '../actions/create-owner.action';
import { ownerKeys } from '../query-keys';
import type { CreateOwnerInput } from '../schemas/create-owner.schema';

/** Creates an owner profile and refreshes the owner list. */
export function useCreateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOwnerInput) => unwrapActionResult(await createOwnerAction(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ownerKeys.all }),
  });
}
