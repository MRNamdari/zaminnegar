import type { Result } from "neverthrow";
import type { EditorConfig } from "../core/config";
import type { DrawEngineError, EditorError, MapEngineError, SyncError } from "../core/errors";
import type { AreaFeature, Level, PolygonGeometry, Position, Tool } from "../core/schemas";

/**
 * Everything the engine needs to render, derived by the application layer.
 * The engine renders exactly `features`; it never filters, hides or invents features.
 */
export interface RenderModel {
  /** Canonical features to draw (already filtered by application visibility). */
  readonly features: readonly AreaFeature[];
  /** Highlighted feature. Ignored visually when the id is not in `features`. */
  readonly selectedFeatureId: string | null;
  /** Features whose geometry may be changed by the user. Everything else is read-only. */
  readonly editableFeatureIds: ReadonlySet<string>;
  /** Features under a local edit session: external geometry updates are held back. */
  readonly lockedFeatureIds: ReadonlySet<string>;
  /** Unsaved drawn geometry that must stay on the map (draft, saving or failed). */
  readonly retainedDraftIds: ReadonlySet<string>;
  /** Level used to colour geometry that is being drawn. */
  readonly drawLevel: Level;
}

export type EngineEvent =
  | { type: "ready" }
  | { type: "selection-requested"; featureId: string | null }
  | { type: "tool-changed"; tool: Tool }
  | { type: "draw-completed"; draftId: string; geometry: PolygonGeometry }
  | { type: "geometry-edited"; featureId: string; geometry: PolygonGeometry }
  | { type: "bearing-changed"; bearing: number }
  | { type: "error"; error: EditorError };

export type EngineListener = (event: EngineEvent) => void;

export interface MapCommands {
  flyTo(position: Position, zoom?: number): Result<void, MapEngineError>;
  fitBounds(bounds: readonly [number, number, number, number], options?: { padding?: number; animate?: boolean }): Result<void, MapEngineError>;
  zoomIn(): Result<void, MapEngineError>;
  zoomOut(): Result<void, MapEngineError>;
  resetBearing(): Result<void, MapEngineError>;
  set3D(enabled: boolean): Result<void, MapEngineError>;
  undo(): Result<boolean, DrawEngineError>;
  redo(): Result<boolean, DrawEngineError>;
}

/** Engine facade. `Raw` is the explicit escape hatch type (see `getRawInstances`). */
export interface MapEngine<Raw = unknown> {
  readonly commands: MapCommands;
  /** Reconciles the engine with application state. Incremental and idempotent. */
  syncRenderModel(model: RenderModel): Result<void, SyncError | DrawEngineError>;
  /** Applies runtime configuration changes without recreating the engine. */
  applyConfig(config: EditorConfig): Result<void, MapEngineError | DrawEngineError>;
  setTool(tool: Tool): Result<void, DrawEngineError>;
  /** Attaches/detaches the overview map. Pass `null` to remove it. */
  setMinimapContainer(container: HTMLElement | null): void;
  subscribe(listener: EngineListener): () => void;
  /** Escape hatch for integrations the contract does not cover. Avoid in application code. */
  getRawInstances(): Raw;
  /** Idempotent. Releases every listener, timer, observer and rendering resource. */
  destroy(): void;
}

export interface CreateEngineOptions {
  container: HTMLElement;
  config: EditorConfig;
}
