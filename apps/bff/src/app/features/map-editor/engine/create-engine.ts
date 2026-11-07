import { err, ok, type Result } from "neverthrow";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { TerraDraw } from "terra-draw";
import type { EditorConfig } from "../core/config";
import { type DrawEngineError, type EditorError, type MapEngineError } from "../core/errors";
import type { Tool } from "../core/schemas";
import type { CreateEngineOptions, EngineEvent, EngineListener, MapEngine, RenderModel } from "./contracts";
import { LabelLayer } from "./maplibre/labels";
import { createMapController } from "./maplibre/map-controller";
import { createDrawController } from "./terradraw/draw-controller";

export interface RawInstances {
  map: MapLibreMap;
  draw: TerraDraw;
}

/** Composes the MapLibre and TerraDraw adapters behind the `MapEngine` contract. */
export function createMapEngine({ container, config: initial }: CreateEngineOptions): Result<MapEngine<RawInstances>, MapEngineError | DrawEngineError> {
  const listeners = new Set<EngineListener>();
  const emit = (event: EngineEvent) => listeners.forEach((listener) => listener(event));
  const report = (error: EditorError) => emit({ type: "error", error });

  let config: EditorConfig = initial;
  let ready = false;
  let destroyed = false;
  let latest: RenderModel | null = null;

  const mapResult = createMapController(container, config, (bearing) => emit({ type: "bearing-changed", bearing }));
  if (mapResult.isErr()) return err(mapResult.error);
  const mapController = mapResult.value;

  const drawResult = createDrawController(mapController.map, config, emit);
  if (drawResult.isErr()) {
    mapController.destroy();
    return err(drawResult.error);
  }
  const drawController = drawResult.value;
  const labels = new LabelLayer(mapController.map);

  const applyModel = (model: RenderModel) => {
    labels.sync(model.features, config.features.labels);
    return drawController.sync(model);
  };

  mapController.map.once("load", () => {
    if (destroyed) return;
    if (config.map.terrain.enabled) mapController.applyTerrain(true).mapErr(report);
    mapController.applyConfig(config).mapErr(report);
    drawController.start().mapErr(report);
    ready = true;
    if (latest) applyModel(latest).mapErr(report);
    emit({ type: "ready" });
  });

  const engine: MapEngine<RawInstances> = {
    commands: {
      ...mapController.commands,
      undo: () => drawController.undo(),
      redo: () => drawController.redo(),
    },

    syncRenderModel(model) {
      latest = model;
      return ready && !destroyed ? applyModel(model) : ok(undefined);
    },

    applyConfig(next) {
      config = next;
      drawController.applyConfig(next);
      if (latest && ready) labels.sync(latest.features, next.features.labels);
      return mapController.applyConfig(next);
    },

    setTool(tool: Tool) {
      return ready ? drawController.setTool(tool) : ok(undefined);
    },

    setMinimapContainer(target) {
      if (!destroyed) mapController.setMinimapContainer(target);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },

    getRawInstances: () => ({ map: mapController.map, draw: drawController.draw }),

    destroy() {
      if (destroyed) return;
      destroyed = true;
      ready = false;
      listeners.clear();
      labels.clear();
      drawController.stop();
      mapController.destroy();
    },
  };

  return ok(engine);
}
