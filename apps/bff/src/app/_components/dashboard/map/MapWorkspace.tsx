'use client';

import { skipToken, useQuery, type QueryKey } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FeatureWorkspaceProvider,
  useApiFeatureGateway,
  useErrorToast,
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

  // One request per create/update/delete, against /map/features.
  const gateway = useApiFeatureGateway(api, { onDiagnostic: logDiagnostic });

  // After every successful create/update/delete the query cache is invalidated and the
  // features are fetched again (the backend derives area, statistics and parent-child
  // relations). Pass `{ invalidate: [featuresKey] }` to narrow that to some queries.
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

  // Failed queries are shown as toasts, translated like any editor error (status and backend code -> Persian).
  useErrorToast(project.error);
  useErrorToast(features.error);
  const noProject = project.isSuccess && !projectId;
  useEffect(() => {
    if (noProject)
      toast.warn('پروژه‌ای وجود ندارد؛ ابتدا یک پروژه بسازید.', {
        toastId: 'map-workspace:no-project',
      });
  }, [noProject]);

  // Requires one <ToastContainer rtl /> in the app (e.g. in the root layout's client providers).
  return (
    <FeatureWorkspaceProvider
      value={value}
      onSelectedFeatureIdChange={setSelected}
      onVisibleFeatureIdsChange={setVisible}
      onEditableFeatureIdsChange={setEditable}
      operations={operations}
      
    >
      {children}
    </FeatureWorkspaceProvider>
  );
}
