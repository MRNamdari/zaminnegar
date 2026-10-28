'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listOwnersAction } from '../actions/list-owners.action';
import { ownerKeys } from '../query-keys';

/** Lists all owners in the system. */
export function useOwners() {
  return useQuery({
    queryKey: ownerKeys.list(),
    queryFn: async () => unwrapActionResult(await listOwnersAction()),
  });
}
