"use client";

import { createContext } from "react";
import type { AreaCollection, Level, MapEditorState, Tool } from "../types";

export interface MapEditorActions {
  setActiveTool: (tool: Tool) => void;
  setActiveLevel: (level: Level) => void;

  selectFeature: (id: string | null) => void;
  deleteSelectedFeature: () => void;

  undo: () => void;
  redo: () => void;
  clear: () => void;

  set3D: (enabled: boolean) => void;

  getGeoJSON: () => AreaCollection;

  flyTo: (coordinates: [number, number], zoom?: number) => void;

  zoomIn: () => void;
  zoomOut: () => void;
}

export const MapEditorStateContext = createContext<MapEditorState | null>(null);

export const MapEditorActionsContext = createContext<MapEditorActions | null>(
  null,
);

import type { MapEngine } from "../types";

export interface MapEditorInternal {
  registerEngine: (engine: MapEngine | null) => void;
  updateFeature: (featureId: string, properties: Record<string, any>) => void;
  updateFeatures: (features: AreaCollection, emit?: boolean) => void;
  setSelected: (id: string | null) => void;
  setBearing: (bearing: number) => void;
}

export const MapEditorInternalContext = createContext<MapEditorInternal | null>(
  null,
);
