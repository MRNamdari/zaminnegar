'use client';

import type { ParcelDto } from '@zaminnegar/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectKeys } from '@/features/projects/query-keys';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { fa } from '@/messages/fa';
import { deleteParcelAction } from '../actions/delete-parcel.action';
import { parcelKeys } from '../query-keys';

/** Deletes one parcel and removes it from the cached list. */
export function useDeleteParcel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...parcelKeys.mutations, 'delete'],
    mutationFn: async (parcelId: string) => {
      unwrapActionResult(await deleteParcelAction(projectId, parcelId));
      return parcelId;
    },
    onSuccess: (parcelId) => {
      queryClient.setQueryData<ParcelDto[]>(parcelKeys.list(projectId), (list) => list?.filter((parcel) => parcel.id !== parcelId));
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(fa.parcels.deleted);
    },
  });
}
