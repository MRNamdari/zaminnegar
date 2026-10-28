'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { assignParcelOwnerAction } from '../actions/assign-parcel-owner.action';
import { ownerKeys } from '../query-keys';
import type { AssignParcelOwnerInput } from '../schemas/assign-parcel-owner.schema';

/** Attaches an owner to a parcel with a share and refreshes live ownership data. */
export function useAssignParcelOwner(parcelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AssignParcelOwnerInput) => unwrapActionResult(await assignParcelOwnerAction(parcelId, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.parcel(parcelId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.list() });
    },
  });
}
