import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import type { Level, Position } from "../../core/schemas";
import { resolveHit, type HitCandidate } from "../../domain/selection";

/**
 * Pixel radius inside which TerraDraw's select mode treats a pointer as "on" a midpoint
 * handle. It is passed to `TerraDrawSelectMode` explicitly so both sides share one value.
 */
export const SELECT_POINTER_DISTANCE_PX = 15;

/** What layer-aware selection needs from the draw controller. */
export interface LayerSelectionPort {
  /** Clicks only mean "select" while the select tool is active; drawing tools own their clicks. */
  isSelectMode(): boolean;
  /** The application layer whose features may currently be selected, or `null` before the first sync. */
  activeLevel(): Level | null;
  /** Every feature the engine holds. Ownership filtering happens in `resolveHit`. */
  candidates(): Iterable<HitCandidate>;
  /** Outer ring (current on-screen geometry) of the feature TerraDraw has selected. */
  selectedRing(): { id: string; ring: readonly Position[] } | null;
  /** Moves the TerraDraw selection (`null` clears it) and informs the application. */
  select(id: string | null): void;
}

export interface LayerSelection {
  start(): void;
  /** Idempotent. Removes the MapLibre listener. */
  stop(): void;
}

type ProjectingMap = Pick<
  MapLibreMap,
  "on" | "off" | "project" | "getCanvasContainer"
>;

/**
 * True when the click lands on one of the selected polygon's edge midpoints. TerraDraw
 * handles that click itself (it inserts a vertex), so it must not also be read as a
 * selection change: a midpoint sits on the outline, i.e. often *outside* the polygon,
 * and would otherwise be mistaken for an empty-map click that clears the selection.
 *
 * The ring must be the one from *before* the click: TerraDraw's own handler may run first
 * and turn the midpoint into a vertex, after which no midpoint is left under the pointer.
 */
function isOnMidpoint(
  map: Pick<MapLibreMap, "project">,
  click: { x: number; y: number },
  ring: readonly Position[],
): boolean {
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i];
    const b = ring[i + 1];
    if (!a || !b) continue;
    const pa = map.project(a);
    const pb = map.project(b);
    const dx = click.x - (pa.x + pb.x) / 2;
    const dy = click.y - (pa.y + pb.y) / 2;
    if (Math.hypot(dx, dy) < SELECT_POINTER_DISTANCE_PX) return true;
  }
  return false;
}

/**
 * Application-controlled selection. TerraDraw's own click-to-select is switched off
 * (`allowManualSelection` / `allowManualDeselection`), so this is the only code path that
 * changes the selection in response to the map, and it only ever picks a feature of the
 * active layer.
 */
export function createLayerSelection(
  map: ProjectingMap,
  port: LayerSelectionPort,
): LayerSelection {
  let bound = false;
  let pressed: ReturnType<LayerSelectionPort["selectedRing"]> | undefined;
  const container = map.getCanvasContainer();

  // Capture phase, so this runs before TerraDraw's own pointer handlers (and so before any
  // edit they make) whatever order TerraDraw and MapLibre dispatch the click in.
  const onPointerDown = () => {
    pressed = port.selectedRing();
  };

  const onClick = (event: MapMouseEvent) => {
    const selected = pressed === undefined ? port.selectedRing() : pressed;
    pressed = undefined;
    if (!port.isSelectMode()) return;
    const level = port.activeLevel();
    if (level === null) return;

    if (selected && isOnMidpoint(map, event.point, selected.ring)) return;

    const hit = resolveHit(
      [event.lngLat.lng, event.lngLat.lat],
      port.candidates(),
      level,
    );
    if (hit === (selected?.id ?? null)) return;
    port.select(hit);
  };

  return {
    start() {
      if (bound) return;
      bound = true;
      container.addEventListener("pointerdown", onPointerDown, true);
      map.on("click", onClick);
    },
    stop() {
      if (!bound) return;
      bound = false;
      pressed = undefined;
      container.removeEventListener("pointerdown", onPointerDown, true);
      map.off("click", onClick);
    },
  };
}
