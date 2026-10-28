'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listParcelOwnersAction } from '../actions/list-parcel-owners.action';
import { ownerKeys } from '../query-keys';

/** Returns owners attached to a parcel and their share percentages. */
export function useParcelOwners(parcelId: string) {
  return useQuery({
    queryKey: ownerKeys.parcel(parcelId),
    queryFn: async () => unwrapActionResult(await listParcelOwnersAction(parcelId)),
    enabled: Boolean(parcelId),
  });
}
