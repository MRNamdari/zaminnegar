"use client";

import { useContext } from "react";
import {
  EditorConfigContext,
  EngineBridgeContext,
  ViewStateContext,
  WorkspaceActionsContext,
  WorkspaceOperationsContext,
  WorkspaceStateContext,
} from "./contexts";
import type { AreaFeature } from "../core/schemas";

function useRequired<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} must be used inside <FeatureWorkspaceProvider>`);
  return value;
}

export const useWorkspaceState = () => useRequired(useContext(WorkspaceStateContext), "useWorkspaceState");
export const useViewState = () => useRequired(useContext(ViewStateContext), "useViewState");
export const useWorkspaceActions = () => useRequired(useContext(WorkspaceActionsContext), "useWorkspaceActions");
export const useWorkspaceOperations = () => useRequired(useContext(WorkspaceOperationsContext), "useWorkspaceOperations");
export const useEditorConfig = () => useRequired(useContext(EditorConfigContext), "useEditorConfig");
/** @internal used by the map canvas */
export const useEngineBridge = () => useRequired(useContext(EngineBridgeContext), "useEngineBridge");

export function useFeature(id: string | null): AreaFeature | undefined {
  const { featuresById } = useWorkspaceState();
  return id === null ? undefined : featuresById.get(id);
}

export function useSelectedFeature(): AreaFeature | undefined {
  const { featuresById, selectedFeatureId } = useWorkspaceState();
  return selectedFeatureId === null ? undefined : featuresById.get(selectedFeatureId);
}

export const useLifecycle = () => useWorkspaceState().lifecycle;
