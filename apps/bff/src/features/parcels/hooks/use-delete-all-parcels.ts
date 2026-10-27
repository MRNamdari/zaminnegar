'use client';

import type { ParcelDto } from '@zaminnegar/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/features/projects/query-keys';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { deleteAllParcelsAction } from '../actions/delete-all-parcels.action';
import { parcelKeys } from '../query-keys';

/** Deletes every parcel of the project and empties the cached list. */
export function useDeleteAllParcels(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...parcelKeys.mutations, 'delete-all'],
    mutationFn: async () => unwrapActionResult(await deleteAllParcelsAction(projectId)),
    onSuccess: () => {
      queryClient.setQueryData<ParcelDto[]>(parcelKeys.list(projectId), []);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
