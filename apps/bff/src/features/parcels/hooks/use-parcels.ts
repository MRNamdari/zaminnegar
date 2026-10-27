'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listParcelsAction } from '../actions/list-parcels.action';
import { parcelKeys } from '../query-keys';

/** All parcels of a project. */
export function useParcels(projectId: string) {
  return useQuery({
    queryKey: parcelKeys.list(projectId),
    queryFn: async () => unwrapActionResult(await listParcelsAction(projectId)),
  });
}
