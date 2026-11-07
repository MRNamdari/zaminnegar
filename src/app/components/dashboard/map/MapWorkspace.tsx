"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FeatureWorkspaceProvider,
  MapEditor,
  useFeatureOperations,
  useWorkspaceActions,
  useWorkspaceState,
  type AreaCollection,
} from "@/app/features/map-editor";
import { featureGateway } from "@/app/_lib/api";
import { featuresQueryKey, featuresQueryOptions } from "@/app/_lib/queries";

const EMPTY: AreaCollection = { type: "FeatureCollection", features: [] };

/** Client entry point: hydrated query data in, controlled workspace out. */
export function MapWorkspace({ children }: { children: React.ReactNode }) {
  const { data, error, isError } = useQuery(featuresQueryOptions());
  const operations = useFeatureOperations(featureGateway, featuresQueryKey);

  // The application owns selection, visibility and edit-ability and could drive them from anywhere (URL, store, ...).
  const [selected, setSelected] = useState<string | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<string> | null>(null);
  const [editable, setEditable] = useState<ReadonlySet<string>>(new Set());
  const value = useMemo(
    () => ({
      features: data ?? EMPTY,
      selectedFeatureId: selected,
      visibleFeatureIds: visible,
      editableFeatureIds: editable,
    }),
    [data, selected, visible, editable],
  );

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
