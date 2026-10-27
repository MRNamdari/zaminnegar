'use client';

import type { ParcelDto, UpdateParcelDto } from '@zaminnegar/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { projectKeys } from '@/features/projects/query-keys';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { updateParcelAction } from '../actions/update-parcel.action';
import { applyParcelPatch } from '../lib/apply-parcel-patch';
import { parcelKeys } from '../query-keys';

interface UpdateParcelVariables {
  parcelId: string;
  patch: UpdateParcelDto;
}

/**
 * Persists a parcel patch. Only server-computed fields (area, timestamp) are merged back,
 * so newer local edits are never overwritten by a slower response. On failure the list is refetched.
 */
export function useUpdateParcel(projectId: string) {
  const queryClient = useQueryClient();
  const listKey = parcelKeys.list(projectId);
  return useMutation({
    mutationKey: [...parcelKeys.mutations, 'update'],
    mutationFn: async ({ parcelId, patch }: UpdateParcelVariables) => unwrapActionResult(await updateParcelAction(projectId, parcelId, patch)),
    onSuccess: (saved, { patch }) => {
      queryClient.setQueryData<ParcelDto[]>(listKey, (list) =>
        list?.map((parcel) => (parcel.id === saved.id ? { ...parcel, areaM2: saved.areaM2, updatedAt: saved.updatedAt } : parcel)),
      );
      if (patch.geometry) void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: () => void queryClient.invalidateQueries({ queryKey: listKey }),
  });
}

/** Returns a function that shows a patch immediately (before it is saved) by updating the cache. */
export function useParcelPreview(projectId: string) {
  const queryClient = useQueryClient();
  return useCallback(
    (parcelId: string, patch: UpdateParcelDto) =>
      queryClient.setQueryData<ParcelDto[]>(parcelKeys.list(projectId), (list) =>
        list?.map((parcel) => (parcel.id === parcelId ? applyParcelPatch(parcel, patch) : parcel)),
      ),
    [queryClient, projectId],
  );
}
