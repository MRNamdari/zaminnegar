// Public API of the map editor. Everything else is internal.
export { FeatureWorkspaceProvider } from "./react/FeatureWorkspaceProvider";
export { DraftConfigurationFlow } from "./react/DraftConfigurationFlow";
export type {
  DraftConfigurationFlowProps,
  DraftConfigurationStep,
  DraftConfigurationStepProps,
  DraftConfigurationValues,
} from "./react/DraftConfigurationFlow";
export type { FeatureWorkspaceProviderProps, WorkspaceValue } from "./react/FeatureWorkspaceProvider";
export {
  useEditorConfig,
  useFeature,
  useLifecycle,
  useSelectedFeature,
  useViewState,
  useWorkspaceActions,
  useWorkspaceOperations,
  useWorkspaceState,
} from "./react/hooks";
export type { ConflictResolution, ViewState, WorkspaceActions, WorkspaceOperations, WorkspaceState } from "./react/contexts";

export { MapEditorLazy as MapEditor } from "./components/MapEditorLazy";
export type { MapEditorComponents, MapEditorProps } from "./components/MapEditor";

export type { FeatureOperations } from "./core/operations";
export { useFeatureOperations } from "./infrastructure/query/use-feature-operations";
export type { FeatureGateway } from "./infrastructure/query/use-feature-operations";
export { EditorFailure, fromPromise, parseResponse, toEditorError, toPromise } from "./infrastructure/query/result-adapters";

export { resolveEditorConfig, editorConfigSchema } from "./core/config";
export type { EditorConfig, EditorConfigInput } from "./core/config";
export * from "./core/schemas";
export * from "./core/errors";
export type { Draft, LifecycleState } from "./domain/lifecycle";
