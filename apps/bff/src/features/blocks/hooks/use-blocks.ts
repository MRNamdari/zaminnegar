'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listBlocksAction } from '../actions/list-blocks.action';
import { blockKeys } from '../query-keys';

/** Lists all blocks of a region. */
export function useBlocks(regionId: string) {
  return useQuery({
    queryKey: blockKeys.list(regionId),
    queryFn: async () => unwrapActionResult(await listBlocksAction(regionId)),
    enabled: Boolean(regionId),
  });
}
