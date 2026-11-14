'use client';

import { skipToken, useQuery, type QueryKey } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  FeatureWorkspaceProvider,
  describeError,
  toEditorError,
  useApiFeatureGateway,
  useFeatureOperations,
  type AreaCollection,
  areaCollectionSchema,
  type GatewayDiagnostic,
} from '@/app/features/map-editor';
import { api as browserApi } from '@/app/_lib/api.client';

const EMPTY: AreaCollection = { type: 'FeatureCollection', features: [] };

export const featuresQueryKey = (projectId: string | null) =>
  ['map-editor', 'features', projectId] as const satisfies QueryKey;

const logDiagnostic = (d: GatewayDiagnostic): void =>
  console.warn('[features-api]', d);

const api = browserApi.client;

async function fetchProjectFeatures(
  projectId: string,
  signal: AbortSignal,
): Promise<AreaCollection> {
  const response = await api.get('/map/features', {
    query: { projectId },
    overrides: { signal },
  });
  return areaCollectionSchema.parse(response);
}

/** Client entry point: API data in, controlled workspace out. */
export function MapWorkspace({ children }: { children: React.ReactNode }) {
  const project = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me'),
  });
  const projectId = project.data?.activeProjectId ?? null;
  const featuresKey = featuresQueryKey(projectId);
  const features = useQuery({
    queryKey: featuresKey,
    queryFn: projectId
      ? ({ signal }) => fetchProjectFeatures(projectId, signal)
      : skipToken,
  });

  const gateway = useApiFeatureGateway(api, featuresKey, {
    onDiagnostic: logDiagnostic,
  });

  const operations = useFeatureOperations(gateway, featuresKey);

  // The application owns selection, visibility and edit-ability and could drive them from anywhere (URL, store, ...).
  const [selected, setSelected] = useState<string | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<string> | null>(null);
  const [editable, setEditable] = useState<ReadonlySet<string>>(new Set());
  const value = useMemo(
    () => ({
      features: features.data ?? EMPTY,
      selectedFeatureId: selected,
      visibleFeatureIds: visible,
      editableFeatureIds: editable,
    }),
    [features.data, selected, visible, editable],
  );

  const problem = project.isError
    ? describeError(toEditorError(project.error)).message
    : features.isError
      ? describeError(toEditorError(features.error)).message
      : project.isSuccess && !projectId
        ? 'پروژه‌ای وجود ندارد؛ ابتدا یک پروژه بسازید.'
        : null;

  return (
    <FeatureWorkspaceProvider
      value={value}
      onSelectedFeatureIdChange={setSelected}
      onVisibleFeatureIdsChange={setVisible}
      onEditableFeatureIdsChange={setEditable}
      operations={operations}
    >
      {problem && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-action-error px-4 py-2 text-sm text-white shadow-lg"
        >
          {problem}
        </div>
      )}
      {children}
    </FeatureWorkspaceProvider>
  );
}
