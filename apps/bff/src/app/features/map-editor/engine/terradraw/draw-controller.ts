import { err, ok, type Result } from "neverthrow";
import {
  TerraDraw,
  TerraDrawModeUndoRedo,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  TerraDrawUndoRedoKeyboardShortcuts,
  type HexColor,
  type GeoJSONStoreFeatures,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { EditorConfig } from "../../core/config";
import {
  drawEngineError,
  syncError,
  type DrawEngineError,
  type SyncError,
} from "../../core/errors";
import {
  polygonGeometrySchema,
  type AreaFeature,
  type Level,
  type Tool,
} from "../../core/schemas";
import { roundGeometry } from "../../domain/geometry";
import { createDraftId, isDraftId } from "../../domain/identity";
import {
  diffRenderModel,
  nextRendered,
} from "../../infrastructure/synchronization/diff";
import type { EngineEvent, RenderModel } from "../contracts";
import { resolveColor } from "./colors";

type Emit = (event: EngineEvent) => void;

const COORDINATE_PRECISION = 9;

const editFlags = (
  editable: boolean,
): NonNullable<ConstructorParameters<typeof TerraDrawSelectMode>[0]> => ({
  flags: {
    polygon: {
      feature: {
        draggable: editable,
        rotateable: editable,
        coordinates: {
          deletable: editable,
          draggable: editable,
          midpoints: { draggable: editable },
          snappable: editable,
        },
      },
    },
  },
});

/** Finish actions that mean "the user changed an existing geometry". */
const EDIT_ACTIONS = new Set([
  "dragFeature",
  "dragCoordinate",
  "dragCoordinateResize",
  "insertMidpoint",
  "deleteCoordinate",
  "edit",
] as const);

export interface DrawController {
  start(): Result<void, DrawEngineError>;
  stop(): void;
  setTool(tool: Tool): Result<void, DrawEngineError>;
  applyConfig(config: EditorConfig): void;
  sync(model: RenderModel): Result<void, SyncError | DrawEngineError>;
  undo(): Result<boolean, DrawEngineError>;
  redo(): Result<boolean, DrawEngineError>;
  readonly draw: TerraDraw;
}

/**
 * Wraps TerraDraw. TerraDraw's store is a *rendering and interaction cache*: it is
 * rebuilt from application state through `sync` and never read back as truth, except
 * for geometry the user has just finished drawing or editing (reported via events).
 */
export function createDrawController(
  map: MapLibreMap,
  initial: EditorConfig,
  emit: Emit,
): Result<DrawController, DrawEngineError> {
  let config = initial;
  let model: RenderModel | null = null;
  let rendered = new Map<string, AreaFeature>();
  let locked: ReadonlySet<string> = new Set();
  const completedDrafts = new Set<string>();
  let selectedId: string | null = null;
  let applying = 0;
  let started = false;

  const levelOf = (feature: GeoJSONStoreFeatures): Level => {
    const level = feature.properties?.level;
    return level === "region" || level === "block" || level === "parcel"
      ? level
      : (model?.drawLevel ?? config.features.defaultLevel);
  };
  const levelColor = (feature: GeoJSONStoreFeatures): HexColor =>
    resolveColor(config.features.levels[levelOf(feature)].color);

  const polygonStyles = (): TerraDrawPolygonMode["_styles"] => ({
    fillColor: levelColor,
    outlineColor: levelColor,
    fillOpacity: config.drawing.styles.fillOpacity,
    outlineWidth: config.drawing.styles.outlineWidth,
  });
  const selectStyles = (): TerraDrawSelectMode["_styles"] => {
    const selected = resolveColor(config.features.selectedColor);
    return {
      selectedPolygonColor: levelColor,
      selectedPolygonFillOpacity: config.drawing.styles.selectedFillOpacity,
      selectedPolygonOutlineColor: selected,
      selectedPolygonOutlineWidth: config.drawing.styles.selectedOutlineWidth,
      selectionPointColor: "#ffffff" as HexColor,
      selectionPointOutlineColor: selected,
      midPointColor: selected,
      midPointOutlineColor: "#ffffff" as HexColor,
    };
  };

  let draw: TerraDraw;
  try {
    draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      // Drafts get a recognisable prefix so they can never be mistaken for database ids.
      idStrategy: {
        isValidId: (id) => typeof id === "string" && id.length > 0,
        getId: () => createDraftId(),
      },
      modes: [
        new TerraDrawSelectMode({
          modeName: "select",
          ...editFlags(false),
          styles: selectStyles(),
        }),
        new TerraDrawPolygonMode({
          styles: polygonStyles(),
          keyEvents: {
            finish: config.drawing.keys.finish,
            cancel: config.drawing.keys.cancel,
          },
        }),
        new TerraDrawRectangleMode({
          styles: polygonStyles(),
          keyEvents: { cancel: config.drawing.keys.cancel, finish: null },
        }),
      ],
      undoRedo: config.drawing.undoRedo
        ? {
            modeLevel: new TerraDrawModeUndoRedo({ maxStackSize: 100 }),
            keyboardShortcuts: new TerraDrawUndoRedoKeyboardShortcuts(),
          }
        : undefined,
    });
  } catch (cause) {
    return err(
      drawEngineError(
        "init_failed",
        "Failed to create the drawing engine",
        cause,
      ),
    );
  }

  const polygonOf = (id: string) => {
    const snapshot = draw.getSnapshotFeature(id);
    const parsed = polygonGeometrySchema.safeParse(snapshot?.geometry);
    return parsed.success ? parsed.data : null;
  };

  const applyEditFlags = (id: string | null) => {
    const editable =
      id !== null && (model?.editableFeatureIds.has(id) ?? false);
    draw.updateModeOptions<typeof TerraDrawSelectMode>(
      "select",
      editFlags(editable),
    );
  };

  draw.on("select", (id) => {
    const key = String(id);
    selectedId = key;
    applyEditFlags(key);
    if (applying === 0 && !isDraftId(key))
      emit({ type: "selection-requested", featureId: key });
  });

  draw.on("deselect", () => {
    selectedId = null;
    applyEditFlags(null);
    if (applying === 0) emit({ type: "selection-requested", featureId: null });
  });

  draw.on("finish", (id, context) => {
    const key = String(id);
    if (context.action === "draw") {
      const geometry = polygonOf(key);
      if (!geometry) {
        emit({
          type: "error",
          error: drawEngineError(
            "feature_rejected",
            "Drawn geometry is not a valid polygon",
          ),
        });
        return;
      }
      completedDrafts.add(key);
      draw.updateFeatureProperties(key, {
        level: model?.drawLevel ?? config.features.defaultLevel,
      });
      // Drawing ends after one geometry; the draft stays on the map until the application settles it.
      draw.setMode("select");
      map.doubleClickZoom.enable();
      emit({ type: "tool-changed", tool: "select" });
      emit({ type: "draw-completed", draftId: key, geometry });
      return;
    }
    if (EDIT_ACTIONS.has(context.action) && !isDraftId(key)) {
      const geometry = polygonOf(key);
      if (geometry) emit({ type: "geometry-edited", featureId: key, geometry });
    }
  });

  const toStoreFeature = (feature: AreaFeature): GeoJSONStoreFeatures => ({
    type: "Feature",
    id: feature.id,
    // TerraDraw rejects coordinates with more than 9 decimals; canonical data may carry float noise.
    geometry: roundGeometry(feature.geometry, COORDINATE_PRECISION),
    properties: { mode: "polygon", level: feature.properties.level },
  });

  const withSelectionSuppressed = <T>(fn: () => T): T => {
    applying++;
    try {
      return fn();
    } finally {
      applying--;
    }
  };

  const syncSelection = (next: RenderModel) => {
    const wanted = next.selectedFeatureId;
    const present =
      wanted !== null &&
      rendered.has(wanted) &&
      draw.getSnapshotFeature(wanted) !== undefined;
    if (selectedId !== null && selectedId !== wanted && !isDraftId(selectedId))
      draw.deselectFeature(selectedId);
    if (present && selectedId !== wanted && wanted !== null) {
      if (draw.getMode() !== "select") draw.setMode("select");
      draw.selectFeature(wanted);
    }
    // Keep edit flags aligned with the latest permissions for whatever is selected.
    if (selectedId !== null) applyEditFlags(selectedId);
  };

  return ok({
    draw,

    start() {
      try {
        draw.start();
        draw.setMode(config.drawing.defaultTool);
        started = true;
        return ok(undefined);
      } catch (cause) {
        return err(
          drawEngineError(
            "init_failed",
            "Failed to start the drawing engine",
            cause,
          ),
        );
      }
    },

    stop() {
      if (!started) return;
      started = false;
      try {
        draw.stop();
      } catch {
        // The map may already be removed; nothing left to release.
      }
    },

    setTool(tool) {
      try {
        draw.setMode(tool);
        if (tool === "select") map.doubleClickZoom.enable();
        else map.doubleClickZoom.disable();
        return ok(undefined);
      } catch (cause) {
        return err(
          drawEngineError(
            "mode_failed",
            `Failed to activate tool "${tool}"`,
            cause,
          ),
        );
      }
    },

    applyConfig(next) {
      config = next;
      if (!started) return;
      draw.updateModeOptions<typeof TerraDrawSelectMode>("select", {
        styles: selectStyles(),
      });
      draw.updateModeOptions<typeof TerraDrawPolygonMode>("polygon", {
        styles: polygonStyles(),
      });
      draw.updateModeOptions<typeof TerraDrawRectangleMode>("rectangle", {
        styles: polygonStyles(),
      });
    },

    sync(next) {
      model = next;
      if (!started) return ok(undefined);
      const diff = diffRenderModel(rendered, locked, next);
      const rejected: string[] = [];

      try {
        withSelectionSuppressed(() => {
          if (diff.remove.length) draw.removeFeatures(diff.remove);
          for (const feature of diff.geometry)
            draw.updateFeatureGeometry(
              feature.id,
              roundGeometry(feature.geometry, COORDINATE_PRECISION),
            );
          for (const feature of diff.properties)
            draw.updateFeatureProperties(feature.id, {
              level: feature.properties.level,
            });
          if (diff.add.length) {
            const results = draw.addFeatures(diff.add.map(toStoreFeature));
            results.forEach((result, index) => {
              if (!result.valid)
                rejected.push(
                  `${diff.add[index]?.id ?? "unknown"} (${result.reason ?? "invalid"})`,
                );
            });
          }
          // Drafts the application has settled (saved, cancelled, discarded) leave the map.
          for (const id of [...completedDrafts]) {
            if (!next.retainedDraftIds.has(id)) {
              completedDrafts.delete(id);
              draw.removeFeatures([id]);
            }
          }
          rendered = nextRendered(rendered, next, diff);
          locked = next.lockedFeatureIds;
          for (const entry of rejected)
            rendered.delete(entry.replace(/ \(.*$/, ""));
          syncSelection(next);
        });
      } catch (cause) {
        return err(
          syncError(
            "apply_failed",
            "Failed to synchronise features with the drawing engine",
            cause,
          ),
        );
      }
      return rejected.length
        ? err(
            drawEngineError(
              "feature_rejected",
              `Drawing engine rejected features: ${rejected.join(", ")}`,
            ),
          )
        : ok(undefined);
    },

    undo() {
      try {
        return ok(draw.undo());
      } catch (cause) {
        return err(drawEngineError("command_failed", "Undo failed", cause));
      }
    },

    redo() {
      try {
        return ok(draw.redo());
      } catch (cause) {
        return err(drawEngineError("command_failed", "Redo failed", cause));
      }
    },
  });
}
