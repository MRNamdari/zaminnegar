import { err, ok, type Result } from "neverthrow";
import { Map as MapLibreMap, LngLatBounds, setWorkerUrl } from "maplibre-gl";
import type { EditorConfig } from "../../core/config";
import { mapEngineError, type MapEngineError } from "../../core/errors";
import type { Position } from "../../core/schemas";
import type { MapCommands } from "../contracts";
import { buildStyle } from "./style";

export interface MapController {
  readonly map: MapLibreMap;
  readonly commands: Pick<MapCommands, "flyTo" | "fitBounds" | "zoomIn" | "zoomOut" | "resetBearing" | "set3D">;
  applyTerrain(enabled: boolean): Result<void, MapEngineError>;
  applyConfig(config: EditorConfig): Result<void, MapEngineError>;
  setMinimapContainer(container: HTMLElement | null): void;
  destroy(): void;
}

const MINIMAP_ZOOM_OFFSET = 4;

/** Served from `public/` by `scripts/copy-maplibre-worker.mjs`; see docs/ARCHITECTURE.md. */
export const MAPLIBRE_WORKER_URL = "/maplibre-gl-worker.mjs";

/** Owns the MapLibre instance (and the overview map). Nothing outside `engine/` touches MapLibre directly. */
export function createMapController(
  container: HTMLElement,
  initial: EditorConfig,
  onBearingChange: (bearing: number) => void,
): Result<MapController, MapEngineError> {
  let config = initial;
  let mini: MapLibreMap | null = null;
  let miniSync: (() => void) | null = null;
  let destroyed = false;

  let map: MapLibreMap;
  try {
    setWorkerUrl(MAPLIBRE_WORKER_URL);
    map = new MapLibreMap({
      container,
      style: config.map.styleUrl ?? buildStyle(config.map.basemap),
      center: config.map.center,
      zoom: config.map.zoom,
      minZoom: config.map.minZoom,
      maxZoom: config.map.maxZoom,
      maxBounds: config.map.bounds,
      maxPitch: 80,
      attributionControl: { compact: true },
    });
  } catch (cause) {
    return err(mapEngineError("init_failed", "Failed to create the map", cause));
  }

  const handleRotate = () => onBearingChange(map.getBearing());
  map.on("rotate", handleRotate);

  const guard = <T,>(label: string, fn: () => T): Result<T, MapEngineError> => {
    if (destroyed) return err(mapEngineError("not_ready", "The map has been destroyed"));
    try {
      return ok(fn());
    } catch (cause) {
      return err(mapEngineError("command_failed", `Map command failed: ${label}`, cause));
    }
  };

  const applyTerrain = (enabled: boolean) =>
    guard("terrain", () => {
      if (enabled) {
        map.setTerrain({ source: "terrain", exaggeration: config.map.terrain.exaggeration });
        map.easeTo({ pitch: config.map.terrain.pitch, duration: 600 });
      } else {
        map.setTerrain(null);
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      }
    });

  const toggle = (handler: { enable(): unknown; disable(): unknown }, enabled: boolean) => {
    if (enabled) handler.enable();
    else handler.disable();
  };

  const applyConfig = (next: EditorConfig) => {
    config = next;
    return guard("config", () => {
      map.setMinZoom(next.map.minZoom);
      map.setMaxZoom(next.map.maxZoom);
      map.setMaxBounds(next.map.bounds ?? null);
      toggle(map.scrollZoom, next.map.interactions.scrollZoom);
      toggle(map.dragRotate, next.map.interactions.dragRotate);
      toggle(map.keyboard, next.map.interactions.keyboard);
      if (!next.map.styleUrl && map.isStyleLoaded()) {
        for (const id of ["satellite", "streets"] as const) {
          map.setLayoutProperty(id, "visibility", id === next.map.basemap ? "visible" : "none");
        }
      }
    });
  };

  const removeMinimap = () => {
    if (miniSync) map.off("move", miniSync);
    mini?.remove();
    mini = null;
    miniSync = null;
  };

  const commands: MapController["commands"] = {
    flyTo: (position: Position, zoom = 16) => guard("flyTo", () => void map.flyTo({ center: position, zoom })),
    fitBounds: (bounds, options) =>
      guard("fitBounds", () => {
        const box = new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]);
        map.fitBounds(box, { padding: options?.padding ?? 80, duration: options?.animate === false ? 0 : 500 });
      }),
    zoomIn: () => guard("zoomIn", () => void map.zoomIn()),
    zoomOut: () => guard("zoomOut", () => void map.zoomOut()),
    resetBearing: () => guard("resetBearing", () => void map.easeTo({ pitch: 0, bearing: 0, duration: 600 })),
    set3D: (enabled) => applyTerrain(enabled),
  };

  return ok({
    map,
    commands,
    applyTerrain,
    applyConfig,

    setMinimapContainer(target) {
      removeMinimap();
      if (!target || destroyed) return;
      const miniMap = new MapLibreMap({
        container: target,
        style: config.map.styleUrl ?? buildStyle(config.map.basemap),
        center: map.getCenter(),
        zoom: Math.max(map.getZoom() - MINIMAP_ZOOM_OFFSET, 0),
        interactive: false,
        attributionControl: false,
      });
      miniSync = () =>
        miniMap.jumpTo({ center: map.getCenter(), zoom: Math.max(map.getZoom() - MINIMAP_ZOOM_OFFSET, 0), bearing: map.getBearing() });
      map.on("move", miniSync);
      mini = miniMap;
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      map.off("rotate", handleRotate);
      removeMinimap();
      map.remove();
    },
  });
}
