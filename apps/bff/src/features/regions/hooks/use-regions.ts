'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listRegionsAction } from '../actions/list-regions.action';
import { regionKeys } from '../query-keys';

/** Lists all regions with parcel counts and extents. */
export function useRegions() {
  return useQuery({
    queryKey: regionKeys.list(),
    queryFn: async () => unwrapActionResult(await listRegionsAction()),
  });
}
