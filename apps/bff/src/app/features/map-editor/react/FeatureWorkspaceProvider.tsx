'use client';

import { err, errAsync, ok, type Result, type ResultAsync } from 'neverthrow';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_EDITOR_CONFIG,
  resolveEditorConfig,
  type EditorConfig,
  type EditorConfigInput,
} from '../core/config';
import {
  applicationError,
  consoleErrorReporter,
  domainError,
  mapEngineError,
  validationError,
  type EditorError,
  type ErrorReporter,
} from '../core/errors';
import type { FeatureOperations } from '../core/operations';
import {
  createFeatureRequestSchema,
  draftConfigurationPropertiesSchema,
  deleteFeatureRequestSchema,
  updateFeatureRequestSchema,
  type AreaCollection,
  type AreaFeature,
  type Level,
  type Tool,
} from '../core/schemas';
import { boundsOf, sameGeometry, validatePolygon } from '../domain/geometry';
import { findParentId } from '../domain/hierarchy';
import {
  activeDraft,
  activeSession,
  detectConflict,
  initialLifecycle,
  isResting,
  lifecycleReducer,
  lockedFeatureIds,
  retainedDraftIds,
  type Draft,
} from '../domain/lifecycle';
import { suggestName } from '../domain/naming';
import {
  checkCreate,
  checkDelete,
  checkEdit,
  checkTool,
} from '../domain/permissions';
import type { EngineEvent, MapEngine, RenderModel } from '../engine/contracts';
import {
  EditorConfigContext,
  EngineBridgeContext,
  ViewStateContext,
  WorkspaceActionsContext,
  WorkspaceOperationsContext,
  WorkspaceStateContext,
  type ConflictResolution,
  type EngineBridge,
  type ViewState,
  type WorkspaceActions,
  type WorkspaceOperations,
  type WorkspaceState,
} from './contexts';
import { useControllable } from './use-controllable';

type IdSet = ReadonlySet<string>;
type IdInput = IdSet | readonly string[];

const EMPTY_IDS: IdSet = new Set();
const toIdSet = (ids: IdInput): IdSet =>
  ids instanceof Set ? ids : new Set(ids);

export interface WorkspaceValue {
  /** Canonical features (required, always controlled by the application). */
  features: AreaCollection;
  /** Omit to let the workspace manage selection itself. */
  selectedFeatureId?: string | null;
  /** `null`/omitted = every feature visible. */
  visibleFeatureIds?: IdInput | null;
  /** Omitted = nothing is editable. */
  editableFeatureIds?: IdInput;
}

export interface FeatureWorkspaceProviderProps {
  value: WorkspaceValue;
  onSelectedFeatureIdChange?: (id: string | null) => void;
  onVisibleFeatureIdsChange?: (ids: IdSet | null) => void;
  onEditableFeatureIdsChange?: (ids: IdSet) => void;
  operations: FeatureOperations;
  config?: EditorConfigInput;
  /** Called for every error the editor produces; defaults to console logging. */
  onError?: ErrorReporter;
  children: ReactNode;
}

export function FeatureWorkspaceProvider({
  value,
  onSelectedFeatureIdChange,
  onVisibleFeatureIdsChange,
  onEditableFeatureIdsChange,
  operations,
  config: configInput,
  onError = consoleErrorReporter,
  children,
}: FeatureWorkspaceProviderProps) {
  /* ------------------------------ configuration ------------------------------ */
  const config = useMemo<EditorConfig>(() => {
    const resolved = resolveEditorConfig(configInput);
    return resolved.isOk() ? resolved.value : DEFAULT_EDITOR_CONFIG;
  }, [configInput]);
  const configError = useMemo(() => {
    const resolved = resolveEditorConfig(configInput);
    return resolved.isErr() ? resolved.error : null;
  }, [configInput]);

  /* --------------------------- application-owned state ------------------------ */
  const features = value.features;
  const featuresById = useMemo(
    () => new Map(features.features.map((f) => [f.id, f] as const)),
    [features],
  );

  const [selectedFeatureId, setSelectedFeatureId] = useControllable<
    string | null
  >(value.selectedFeatureId, null, onSelectedFeatureIdChange);
  const controlledVisible = useMemo(
    () =>
      value.visibleFeatureIds === undefined
        ? undefined
        : value.visibleFeatureIds === null
          ? null
          : toIdSet(value.visibleFeatureIds),
    [value.visibleFeatureIds],
  );
  const [visibleFeatureIds, setVisibleFeatureIds] =
    useControllable<IdSet | null>(
      controlledVisible,
      null,
      onVisibleFeatureIdsChange,
    );
  const controlledEditable = useMemo(
    () =>
      value.editableFeatureIds === undefined
        ? undefined
        : toIdSet(value.editableFeatureIds),
    [value.editableFeatureIds],
  );
  const [editableFeatureIds, setEditableFeatureIds] = useControllable<IdSet>(
    controlledEditable,
    EMPTY_IDS,
    onEditableFeatureIdsChange,
  );

  /* ----------------------------- editor-owned state --------------------------- */
  const [activeTool, setActiveToolState] = useState<Tool>('select');
  const [activeLevel, setActiveLevel] = useState<Level>(
    config.features.defaultLevel,
  );
  const [lifecycle, dispatch] = useReducer(lifecycleReducer, initialLifecycle);
  const [view, setView] = useState<ViewState>({
    isMapReady: false,
    bearing: 0,
    is3D: config.map.terrain.enabled,
  });

  /* ------------------------ latest values for stable callbacks ---------------- */
  const latest = useRef({
    featuresById,
    features,
    config,
    editableFeatureIds,
    lifecycle,
    activeTool,
    activeLevel,
    selectedFeatureId,
    operations,
    onError,
  });
  useEffect(() => {
    latest.current = {
      featuresById,
      features,
      config,
      editableFeatureIds,
      lifecycle,
      activeTool,
      activeLevel,
      selectedFeatureId,
      operations,
      onError,
    };
  });
  const engineRef = useRef<MapEngine | null>(null);

  const effectiveEditable = useMemo<IdSet>(
    () => (config.permissions.edit ? editableFeatureIds : EMPTY_IDS),
    [config.permissions.edit, editableFeatureIds],
  );

  const report = useCallback((error: EditorError, operation: string) => {
    latest.current.onError(error, { operation });
  }, []);

  useEffect(() => {
    if (configError) report(configError, 'resolve-config');
  }, [configError, report]);

  /** Reports an error and returns it, for use inside `mapErr`. */
  const reported = useCallback(
    (operation: string) => (error: EditorError) => {
      report(error, operation);
      return error;
    },
    [report],
  );
  const failNow = useCallback(
    <T,>(error: EditorError, operation: string): Result<T, EditorError> => {
      report(error, operation);
      return err(error);
    },
    [report],
  );

  const requireEngine = useCallback((): Result<MapEngine, EditorError> => {
    const engine = engineRef.current;
    return engine
      ? ok(engine)
      : err(mapEngineError('not_ready', 'The map is not ready yet'));
  }, []);

  /* --------------------------------- derived ---------------------------------- */
  const renderedFeatures = useMemo(
    () =>
      visibleFeatureIds === null
        ? features.features
        : features.features.filter((f) => visibleFeatureIds.has(f.id)),
    [features, visibleFeatureIds],
  );
  const locked = useMemo(() => lockedFeatureIds(lifecycle), [lifecycle]);
  const retained = useMemo(() => retainedDraftIds(lifecycle), [lifecycle]);

  const renderModel = useMemo<RenderModel>(
    () => ({
      features: renderedFeatures,
      selectedFeatureId,
      editableFeatureIds: effectiveEditable,
      lockedFeatureIds: locked,
      retainedDraftIds: retained,
      drawLevel: activeLevel,
    }),
    [
      renderedFeatures,
      selectedFeatureId,
      effectiveEditable,
      locked,
      retained,
      activeLevel,
    ],
  );

  /* ------------------------ conflicts with external updates ------------------- */
  useEffect(() => {
    const session = activeSession(lifecycle);
    if (!session || lifecycle.status === 'updating') return;
    const conflict = detectConflict(
      session.base,
      featuresById.get(session.featureId),
      sameGeometry,
    );
    const known = session.conflict;
    const unchanged =
      (conflict === null && known === null) ||
      (conflict?.kind === 'deleted' && known?.kind === 'deleted') ||
      (conflict?.kind === 'updated' &&
        known?.kind === 'updated' &&
        known.server === conflict.server);
    if (conflict && !unchanged)
      dispatch({ type: 'conflict-detected', conflict });
  }, [featuresById, lifecycle]);

  /* ----------------- selection cleanup when a feature disappears --------------- */
  const previousIds = useRef<ReadonlyMap<string, AreaFeature>>(featuresById);
  useEffect(() => {
    const selected = latest.current.selectedFeatureId;
    if (
      selected !== null &&
      previousIds.current.has(selected) &&
      !featuresById.has(selected)
    )
      setSelectedFeatureId(null);
    previousIds.current = featuresById;
  }, [featuresById, setSelectedFeatureId]);

  /* -------------------------------- operations -------------------------------- */
  const issues = (error: {
    issues: readonly { path: PropertyKey[]; message: string }[];
  }) =>
    error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));

  const createFeature = useCallback<WorkspaceOperations['createFeature']>(
    (request) => {
      const parsed = createFeatureRequestSchema.safeParse(request);
      if (!parsed.success)
        return errAsync(
          reported('create')(
            validationError(
              'invalid_schema',
              'Invalid create request',
              issues(parsed.error),
            ),
          ),
        );
      const { config: cfg, operations: ops } = latest.current;
      const allowed = checkCreate(
        cfg.permissions,
        parsed.data.properties.level,
      );
      if (allowed.isErr()) return errAsync(reported('create')(allowed.error));
      const valid = validatePolygon(
        parsed.data.geometry,
        cfg.features.validation,
      );
      if (valid.isErr()) return errAsync(reported('create')(valid.error));
      return ops.createFeature(parsed.data).mapErr(reported('create'));
    },
    [reported],
  );

  const updateFeature = useCallback<WorkspaceOperations['updateFeature']>(
    (request) => {
      const parsed = updateFeatureRequestSchema.safeParse(request);
      if (!parsed.success)
        return errAsync(
          reported('update')(
            validationError(
              'invalid_schema',
              'Invalid update request',
              issues(parsed.error),
            ),
          ),
        );
      const {
        config: cfg,
        editableFeatureIds: editable,
        operations: ops,
      } = latest.current;
      const allowed = checkEdit(cfg.permissions, editable, parsed.data.id);
      if (allowed.isErr()) return errAsync(reported('update')(allowed.error));
      const valid = validatePolygon(
        parsed.data.geometry,
        cfg.features.validation,
      );
      if (valid.isErr()) return errAsync(reported('update')(valid.error));
      return ops.updateFeature(parsed.data).mapErr(reported('update'));
    },
    [reported],
  );

  /** `ignoreSession` is only for retrying a failed delete, whose failure state is being replaced. */
  const runDelete = useCallback(
    (
      id: string,
      ignoreSession: boolean,
    ): ResultAsync<{ id: string }, EditorError> => {
      const {
        config: cfg,
        editableFeatureIds: editable,
        operations: ops,
        lifecycle: lc,
        featuresById: byId,
      } = latest.current;
      const parsed = deleteFeatureRequestSchema.safeParse({
        id,
        expectedVersion: byId.get(id)?.properties.version,
      });
      if (!parsed.success)
        return errAsync(
          reported('delete')(
            validationError(
              'invalid_schema',
              'Invalid delete request',
              issues(parsed.error),
            ),
          ),
        );
      if (!byId.has(id))
        return errAsync(
          reported('delete')(
            domainError('feature_not_found', `Feature ${id} does not exist`),
          ),
        );
      const allowed = checkDelete(cfg.permissions, editable, id);
      if (allowed.isErr()) return errAsync(reported('delete')(allowed.error));
      if (!ignoreSession && !isResting(lc)) {
        return errAsync(
          reported('delete')(
            domainError(
              'session_in_progress',
              'Finish or cancel the current edit first',
            ),
          ),
        );
      }
      return ops.deleteFeature(parsed.data).mapErr((error) => {
        dispatch({ type: 'delete-failed', featureId: id, error });
        return reported('delete')(error);
      });
    },
    [reported],
  );

  const deleteFeature = useCallback<WorkspaceOperations['deleteFeature']>(
    (id) => runDelete(id, false),
    [runDelete],
  );

  const runDraftSave = useCallback(
    (draft: Draft): ResultAsync<AreaFeature, EditorError> => {
      dispatch({ type: 'save-started' });
      return createFeature({
        draftId: draft.draftId,
        geometry: draft.geometry,
        properties: {
          ...draft.extraProperties,
          level: draft.level,
          name: draft.name,
          parentId: draft.parentId,
        },
      })
        .map((feature) => {
          dispatch({ type: 'create-succeeded', featureId: feature.id });
          setSelectedFeatureId(feature.id);
          return feature;
        })
        .mapErr((error) => {
          dispatch({ type: 'operation-failed', error });
          return error;
        });
    },
    [createFeature, setSelectedFeatureId],
  );

  const saveDraft = useCallback<WorkspaceOperations['saveDraft']>(() => {
    const draft = activeDraft(latest.current.lifecycle);
    return draft
      ? runDraftSave(draft)
      : errAsync(
          reported('save-draft')(
            domainError('no_active_session', 'There is no draft to save'),
          ),
        );
  }, [reported, runDraftSave]);

  const saveEdit = useCallback<WorkspaceOperations['saveEdit']>(() => {
    const session = activeSession(latest.current.lifecycle);
    if (!session)
      return errAsync(
        reported('save-edit')(
          domainError('no_active_session', 'There is no edit to save'),
        ),
      );
    if (session.conflict) {
      return errAsync(
        reported('save-edit')(
          applicationError(
            'conflict',
            'The feature changed on the server. Resolve the conflict before saving.',
            session.featureId,
          ),
        ),
      );
    }
    dispatch({ type: 'save-started' });
    return updateFeature({
      id: session.featureId,
      expectedVersion: session.base.properties.version,
      geometry: session.geometry,
    })
      .map((feature) => {
        dispatch({ type: 'update-succeeded', featureId: feature.id });
        return feature;
      })
      .mapErr((error) => {
        dispatch({ type: 'operation-failed', error });
        return error;
      });
  }, [reported, updateFeature]);

  const retry = useCallback<WorkspaceOperations['retry']>(() => {
    const { lifecycle: lc } = latest.current;
    if (lc.status !== 'failed')
      return errAsync(
        reported('retry')(domainError('no_active_session', 'Nothing to retry')),
      );
    const { failure } = lc;
    if (failure.draft) return runDraftSave(failure.draft);
    if (failure.session) return saveEdit();
    if (failure.featureId) {
      dispatch({ type: 'cancelled' });
      return runDelete(failure.featureId, true);
    }
    return errAsync(
      reported('retry')(
        domainError('invalid_state', 'Failure has nothing to retry'),
      ),
    );
  }, [reported, runDelete, runDraftSave, saveEdit]);

  const operationsValue = useMemo<WorkspaceOperations>(
    () => ({
      createFeature,
      updateFeature,
      deleteFeature,
      saveDraft,
      saveEdit,
      retry,
    }),
    [createFeature, updateFeature, deleteFeature, saveDraft, saveEdit, retry],
  );

  /* ---------------------------------- actions --------------------------------- */
  const setActiveTool = useCallback<WorkspaceActions['setActiveTool']>(
    (tool) => {
      const { config: cfg, lifecycle: lc, activeLevel: level } = latest.current;
      const allowed = checkTool(cfg.permissions, cfg.drawing.tools, tool);
      if (allowed.isErr()) return failNow(allowed.error, 'set-tool');

      if (tool === 'select') {
        if (lc.status === 'drawing') dispatch({ type: 'drawing-cancelled' });
      } else {
        const canCreate = checkCreate(cfg.permissions, level);
        if (canCreate.isErr()) return failNow(canCreate.error, 'set-tool');
        if (!isResting(lc) && lc.status !== 'drawing') {
          return failNow(
            domainError(
              'session_in_progress',
              'Finish or cancel the current draft or edit first',
            ),
            'set-tool',
          );
        }
        dispatch({ type: 'drawing-started', tool });
      }
      const engine = engineRef.current;
      if (engine) {
        const result = engine.setTool(tool);
        if (result.isErr()) return failNow(result.error, 'set-tool');
      }
      setActiveToolState(tool);
      return ok(undefined);
    },
    [failNow],
  );

  const actions = useMemo<WorkspaceActions>(() => {
    const engineCmd = <T,>(
      run: (engine: MapEngine) => Result<T, EditorError>,
      operation: string,
    ): Result<T, EditorError> => {
      const engine = requireEngine();
      if (engine.isErr()) return failNow(engine.error, operation);
      return run(engine.value).mapErr(reported(operation));
    };

    return {
      selectFeature(id) {
        if (!latest.current.featuresById.has(id))
          return failNow(
            domainError('feature_not_found', `Feature ${id} does not exist`),
            'select',
          );
        if (latest.current.activeTool !== 'select') {
          const switched = setActiveTool('select');
          if (switched.isErr()) return switched;
        }
        setSelectedFeatureId(id);
        return ok(undefined);
      },
      clearSelection() {
        setSelectedFeatureId(null);
        return ok(undefined);
      },
      setActiveTool,
      cancelDrawing: () => setActiveTool('select'),
      setActiveLevel,
      setVisibleFeatureIds,
      setEditableFeatureIds,
      focusFeature(id) {
        const feature = latest.current.featuresById.get(id);
        if (!feature)
          return failNow(
            domainError('feature_not_found', `Feature ${id} does not exist`),
            'focus',
          );
        const bounds = boundsOf([feature]);
        if (!bounds)
          return failNow(
            domainError('invalid_state', 'Feature has no geometry'),
            'focus',
          );
        return engineCmd(
          (engine) => engine.commands.fitBounds(bounds),
          'focus',
        );
      },
      completeDraftConfiguration(properties) {
        const { lifecycle: lc } = latest.current;
        if (lc.status !== 'configuring') {
          return failNow(
            domainError(
              'no_active_session',
              'There is no draft awaiting configuration',
            ),
            'complete-draft-configuration',
          );
        }

        const parsed = draftConfigurationPropertiesSchema.safeParse(properties);
        if (!parsed.success) {
          return failNow(
            validationError(
              'invalid_schema',
              'Invalid draft configuration',
              issues(parsed.error),
            ),
            'complete-draft-configuration',
          );
        }

        const { name, parentId, ...extraProperties } = parsed.data;
        const draft: Draft = {
          ...lc.draft,
          name: name ?? lc.draft.name,
          parentId: parentId === undefined ? lc.draft.parentId : parentId,
          extraProperties: {
            ...lc.draft.extraProperties,
            ...extraProperties,
          },
        };

        dispatch({ type: 'configuration-completed', draft });
        // This workflow always saves after the final form, independent of the
        // legacy autoSaveDrafts setting (which previously saved on draw-completed).
        void runDraftSave(draft);
        return ok(undefined);
      },
      cancelSession() {
        const { lifecycle: lc } = latest.current;
        if (lc.status === 'saving' || lc.status === 'updating') {
          return failNow(
            domainError('session_in_progress', 'A save is in progress'),
            'cancel-session',
          );
        }
        dispatch({ type: 'cancelled' });
        return ok(undefined);
      },
      resolveConflict(resolution: ConflictResolution) {
        const session = activeSession(latest.current.lifecycle);
        if (!session?.conflict)
          return failNow(
            domainError('no_active_session', 'There is no conflict to resolve'),
            'resolve-conflict',
          );
        if (
          resolution === 'use-server' ||
          session.conflict.kind === 'deleted'
        ) {
          dispatch({ type: 'cancelled' });
          return ok(undefined);
        }
        dispatch({
          type: 'conflict-kept-local',
          server: session.conflict.server,
        });
        return ok(undefined);
      },
      flyTo: (position, zoom) =>
        engineCmd((e) => e.commands.flyTo(position, zoom), 'fly-to'),
      zoomIn: () => engineCmd((e) => e.commands.zoomIn(), 'zoom-in'),
      zoomOut: () => engineCmd((e) => e.commands.zoomOut(), 'zoom-out'),
      resetBearing: () =>
        engineCmd((e) => e.commands.resetBearing(), 'reset-bearing'),
      set3D(enabled) {
        const result = engineCmd((e) => e.commands.set3D(enabled), 'set-3d');
        if (result.isOk()) setView((v) => ({ ...v, is3D: enabled }));
        return result;
      },
      undo: () => engineCmd((e) => e.commands.undo(), 'undo'),
      redo: () => engineCmd((e) => e.commands.redo(), 'redo'),
    };
  }, [
    failNow,
    reported,
    requireEngine,
    runDraftSave,
    setActiveTool,
    setEditableFeatureIds,
    setSelectedFeatureId,
    setVisibleFeatureIds,
  ]);

  /* ------------------------------ engine → workspace -------------------------- */
  const handleEngineEvent = useCallback(
    (event: EngineEvent) => {
      const {
        config: cfg,
        featuresById: byId,
        editableFeatureIds: editable,
        activeLevel: level,
      } = latest.current;
      switch (event.type) {
        case 'ready':
          setView((v) => ({ ...v, isMapReady: true }));
          if (cfg.drawing.defaultTool !== 'select')
            setActiveTool(cfg.drawing.defaultTool);
          return;
        case 'selection-requested':
          setSelectedFeatureId(event.featureId);
          return;
        case 'tool-changed':
          setActiveToolState(event.tool);
          return;
        case 'bearing-changed':
          setView((v) =>
            Math.abs(v.bearing - event.bearing) < 0.001
              ? v
              : { ...v, bearing: event.bearing },
          );
          return;
        case 'error':
          report(event.error, 'engine');
          return;
        case 'draw-completed': {
          const label = cfg.features.levels[level].label;
          const draft: Draft = {
            draftId: event.draftId,
            geometry: event.geometry,
            level,
            name: suggestName(
              level,
              label,
              [...byId.values()],
              cfg.features.naming,
            ),
            parentId: findParentId(
              level,
              event.geometry,
              [...byId.values()],
              cfg.features.hierarchy,
            ),
            extraProperties: {},
          };
          dispatch({ type: 'draw-completed', draft });
          return;
        }
        case 'geometry-edited': {
          const base = byId.get(event.featureId);
          if (!base) {
            report(
              domainError(
                'feature_not_found',
                `Edited feature ${event.featureId} is not in the workspace`,
              ),
              'geometry-edited',
            );
            return;
          }
          const allowed = checkEdit(cfg.permissions, editable, event.featureId);
          if (allowed.isErr()) {
            report(allowed.error, 'geometry-edited');
            return;
          }
          dispatch({
            type: 'edit-changed',
            base,
            geometry: { ...event.geometry },
          });
        }
      }
    },
    [report, setActiveTool, setSelectedFeatureId],
  );

  const registerEngine = useCallback((engine: MapEngine | null) => {
    engineRef.current = engine;
    if (engine === null) setView((v) => ({ ...v, isMapReady: false }));
  }, []);

  /* ---------------------------------- contexts -------------------------------- */
  const stateValue = useMemo<WorkspaceState>(
    () => ({
      features,
      featuresById,
      selectedFeatureId,
      visibleFeatureIds: visibleFeatureIds ?? new Set<string>(),
      editableFeatureIds,
      activeTool,
      activeLevel,
      lifecycle,
    }),
    [
      features,
      featuresById,
      selectedFeatureId,
      visibleFeatureIds,
      editableFeatureIds,
      activeTool,
      activeLevel,
      lifecycle,
    ],
  );
  const bridge = useMemo<EngineBridge>(
    () => ({ renderModel, config, registerEngine, handleEngineEvent, report }),
    [renderModel, config, registerEngine, handleEngineEvent, report],
  );

  return (
    <EditorConfigContext.Provider value={config}>
      <WorkspaceActionsContext.Provider value={actions}>
        <WorkspaceOperationsContext.Provider value={operationsValue}>
          <WorkspaceStateContext.Provider value={stateValue}>
            <ViewStateContext.Provider value={view}>
              <EngineBridgeContext.Provider value={bridge}>
                {children}
              </EngineBridgeContext.Provider>
            </ViewStateContext.Provider>
          </WorkspaceStateContext.Provider>
        </WorkspaceOperationsContext.Provider>
      </WorkspaceActionsContext.Provider>
    </EditorConfigContext.Provider>
  );
}
