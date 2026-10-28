'use client';

import type { MultiPolygonDto, ParcelDto } from '@zaminnegar/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectKeys } from '@/features/projects/query-keys';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { fa } from '@/messages/fa';
import { createParcelAction } from '../actions/create-parcel.action';
import { nextParcelColor, nextParcelName } from '../lib/next-parcel-defaults';
import { parcelKeys } from '../query-keys';

/** Creates a parcel from a drawn geometry, choosing a unique default name and color. */
export function useCreateParcel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...parcelKeys.mutations, 'create'],
    mutationFn: async (geometry: MultiPolygonDto) => {
      const existing = queryClient.getQueryData<ParcelDto[]>(parcelKeys.list(projectId)) ?? [];
      return unwrapActionResult(
        await createParcelAction(projectId, {
          name: nextParcelName(existing),
          geometry,
          fillColor: nextParcelColor(existing),
          fillOpacity: 0.35,
          strokeColor: '#1b2a24',
          strokeWidth: 2,
        }),
      );
    },
    onSuccess: (parcel) => {
      queryClient.setQueryData<ParcelDto[]>(parcelKeys.list(projectId), (current = []) => [...current, parcel]);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(fa.parcels.created);
    },
  });
}
