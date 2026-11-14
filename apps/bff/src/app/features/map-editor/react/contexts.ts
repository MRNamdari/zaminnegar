"use client";

import { createContext } from "react";
import type { Result, ResultAsync } from "neverthrow";
import type { EditorConfig } from "../core/config";
import type { EditorError, ErrorReporter } from "../core/errors";
import type {
  AreaCollection,
  AreaFeature,
  CreateFeatureRequest,
  Level,
  Position,
  Tool,
  UpdateFeatureRequest,
} from "../core/schemas";
import type { LifecycleState } from "../domain/lifecycle";
import type { EngineEvent, MapEngine, RenderModel } from "../engine/contracts";

/** Application-provided data plus the editor's own interaction state. One source per fact. */
export interface WorkspaceState {
  /** The canonical collection exactly as supplied by the application. */
  readonly features: AreaCollection;
  /** Derived lookup over `features`; same lifetime, never independently authoritative. */
  readonly featuresById: ReadonlyMap<string, AreaFeature>;
  readonly selectedFeatureId: string | null;
  /** `null` means every feature is visible. */
  readonly visibleFeatureIds: ReadonlySet<string>;
  readonly editableFeatureIds: ReadonlySet<string>;
  readonly activeTool: Tool;
  readonly activeLevel: Level;
  readonly lifecycle: LifecycleState;
}

/** High-frequency, map-originated state kept apart so list/detail panels do not re-render on rotation. */
export interface ViewState {
  readonly isMapReady: boolean;
  readonly bearing: number;
  readonly is3D: boolean;
}

export type ConflictResolution = "keep-local" | "use-server";
type Cmd<T = void> = Result<T, EditorError>;

/** Synchronous commands. They fail with a typed error instead of silently doing nothing. */
export interface WorkspaceActions {
  selectFeature(id: string): Cmd;
  clearSelection(): Cmd;
  setActiveTool(tool: Tool): Cmd;
  cancelDrawing(): Cmd;
  setActiveLevel(level: Level): void;
  /** Request a visibility change (`null` = show all). Applied directly when uncontrolled. */
  setVisibleFeatureIds(ids: ReadonlySet<string> | null): void;
  setEditableFeatureIds(ids: ReadonlySet<string>): void;
  focusFeature(id: string): Cmd;
  /** Completes the sequential draft forms and automatically starts creation. */
  completeDraftConfiguration(
    properties: Readonly<Record<string, unknown>>,
  ): Cmd;
  /** Discards the current draft, local edit, or failure (not allowed while a request is in flight). */
  cancelSession(): Cmd;
  resolveConflict(resolution: ConflictResolution): Cmd;
  flyTo(position: Position, zoom?: number): Cmd;
  zoomIn(): Cmd;
  zoomOut(): Cmd;
  resetBearing(): Cmd;
  set3D(enabled: boolean): Cmd;
  undo(): Cmd<boolean>;
  redo(): Cmd<boolean>;
}

type Op<T> = ResultAsync<T, EditorError>;

/** Asynchronous operations; each resolves with the backend-confirmed result. */
export interface WorkspaceOperations {
  createFeature(request: CreateFeatureRequest): Op<AreaFeature>;
  updateFeature(request: UpdateFeatureRequest): Op<AreaFeature>;
  deleteFeature(id: string): Op<{ id: string }>;
  /** Persists the current draft (needed when `drawing.autoSaveDrafts` is false). */
  saveDraft(): Op<AreaFeature>;
  /** Commits the current local geometry edit. */
  saveEdit(): Op<AreaFeature>;
  /** Re-runs the operation that failed, with the geometry that was retained. */
  retry(): Op<unknown>;
}

/** Internal wiring between the provider and the canvas. Not part of the public API. */
export interface EngineBridge {
  readonly renderModel: RenderModel;
  readonly config: EditorConfig;
  registerEngine(engine: MapEngine | null): void;
  handleEngineEvent(event: EngineEvent): void;
  report(error: EditorError, operation: string): void;
}

export const WorkspaceStateContext = createContext<WorkspaceState | null>(null);
export const ViewStateContext = createContext<ViewState | null>(null);
export const WorkspaceActionsContext = createContext<WorkspaceActions | null>(
  null,
);
export const WorkspaceOperationsContext =
  createContext<WorkspaceOperations | null>(null);
export const EditorConfigContext = createContext<EditorConfig | null>(null);
export const EngineBridgeContext = createContext<EngineBridge | null>(null);
export type { ErrorReporter };
