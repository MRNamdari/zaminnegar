import { queryOptions } from '@tanstack/react-query';
import { toPromise } from '@/app/features/map-editor';
import { fetchFeatures, resolveProjectId } from './feature-gateway';

export const projectQueryKey = ['project'] as const;

export const projectQueryOptions = () =>
  queryOptions({
    queryKey: projectQueryKey,
    queryFn: ({ signal }) => toPromise(resolveProjectId(signal)),
    staleTime: Infinity,
  });

export const featuresQueryKey = (projectId: string | null | undefined) =>
  ['features', projectId ?? null] as const;

export const featuresQueryOptions = (projectId: string | null | undefined) =>
  queryOptions({
    queryKey: featuresQueryKey(projectId),
    queryFn: ({ signal }) => toPromise(fetchFeatures(projectId as string, signal)),
    enabled: Boolean(projectId),
  });
