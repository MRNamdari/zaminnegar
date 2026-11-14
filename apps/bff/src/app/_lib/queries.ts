import { queryOptions, skipToken } from '@tanstack/react-query';
import {
  isRetryable,
  toEditorError,
  toPromise,
} from '@/app/features/map-editor';
import { fetchFeatures, resolveProjectId } from './feature-gateway';

/** Retry only what could plausibly succeed (network drops, 5xx), never a 4xx rejection. */
const retry = (failureCount: number, error: unknown): boolean =>
  failureCount < 2 && isRetryable(toEditorError(error));

export const projectQueryKey = ['project'] as const;

export const projectQueryOptions = () =>
  queryOptions({
    queryKey: projectQueryKey,
    queryFn: ({ signal }) => toPromise(resolveProjectId(signal)),
    staleTime: Infinity,
    retry,
  });

export const featuresQueryKey = (projectId: string | null | undefined) =>
  ['features', projectId ?? null] as const;

/** Stays idle until a project id is known (`skipToken` instead of a cast + `enabled`). */
export const featuresQueryOptions = (projectId: string | null | undefined) =>
  queryOptions({
    queryKey: featuresQueryKey(projectId),
    queryFn: projectId
      ? ({ signal }) => toPromise(fetchFeatures(projectId, signal))
      : skipToken,
    retry,
  });
