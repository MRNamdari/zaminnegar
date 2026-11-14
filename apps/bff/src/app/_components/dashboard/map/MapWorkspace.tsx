"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FeatureWorkspaceProvider,
  describeError,
  toEditorError,
  useFeatureOperations,
  type AreaCollection,
} from "@/app/features/map-editor";
import { createFeatureGateway } from "@/app/_lib/feature-gateway";
import {
  featuresQueryKey,
  featuresQueryOptions,
  projectQueryOptions,
} from "@/app/_lib/queries";

const EMPTY: AreaCollection = { type: "FeatureCollection", features: [] };

/** Client entry point: API data in, controlled workspace out. */
export function MapWorkspace({ children }: { children: React.ReactNode }) {
  const project = useQuery(projectQueryOptions());
  const projectId = project.data;
  const features = useQuery(featuresQueryOptions(projectId));

  const gateway = useMemo(() => createFeatureGateway(projectId ?? undefined), [projectId]);
  const operations = useFeatureOperations(gateway, featuresQueryKey(projectId));

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
      : project.isSuccess && projectId === null
        ? "پروژه‌ای وجود ندارد؛ ابتدا یک پروژه بسازید."
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
