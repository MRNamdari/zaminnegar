'use client';

import { useQuery } from '@tanstack/react-query';
import { unwrapActionResult } from '@/lib/actions/unwrap-action-result';
import { listProjectsAction } from '../actions/list-projects.action';
import { projectKeys } from '../query-keys';

/** All projects with parcel counts and extents. */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => unwrapActionResult(await listProjectsAction()),
  });
}
