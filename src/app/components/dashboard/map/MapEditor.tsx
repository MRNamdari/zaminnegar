"use client";

/**
 * MapEditor — ویرایشگر نقشه‌ی ماهواره‌ای با MapLibre GL + Terra Draw (هر دو open source)
 *
 * نصب:
 *   npm i maplibre-gl terra-draw terra-draw-maplibre-gl-adapter
 *
 * استفاده (پیشنهاد: بدون SSR):
 *   const MapEditor = dynamic(() => import("@/components/MapEditor"), { ssr: false });
 *   <MapEditor onChange={(fc) => console.log(fc)} />
 *
 * خروجی: GeoJSON FeatureCollection با مختصات [lng, lat] (استاندارد RFC 7946 / EPSG:4326)
 * هر Feature این properties را دارد: id, level, name, parentId, areaHa
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  TerraDrawModeUndoRedo,
  TerraDrawSessionUndoRedo,
  TerraDrawUndoRedoKeyboardShortcuts,
  HexColor,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

/* ----------------------------- Types & config ----------------------------- */

export type Level = "region" | "block" | "parcel";
type Tool = "select" | "polygon" | "rectangle";

export interface AreaProperties {
  id: string;
  level: Level;
  name: string;
  parentId: string | null;
  areaHa: number;
}

export interface AreaFeature {
  type: "Feature";
  id?: string | number;
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: AreaProperties;
}

export interface AreaCollection {
  type: "FeatureCollection";
  features: AreaFeature[];
}

export interface MapEditorHandle {
  getGeoJSON: () => AreaCollection;
  clear: () => void;
}

export interface MapEditorProps {
  /** [lng, lat] */
  center?: [number, number];
  zoom?: number;
  /** داده‌های ذخیره‌شده از بک‌اند (شناسه‌ها باید UUID v4 باشند، وگرنه حذف می‌شوند) */
  initialData?: AreaCollection;
  /** هر بار که شکلی کشیده/ویرایش/حذف شد صدا زده می‌شود */
  onChange?: (data: AreaCollection) => void;
  className?: string;
}

const LEVELS: Record<Level, { label: string; color: string }> = {
  region: { label: "منطقه", color: "--map-green" },
  block: { label: "بلوک", color: "--map-blue" },
  parcel: { label: "قطعه", color: "--map-yellow" },
};
const SELECTED_COLOR = "--map-purple";

// منبع تصاویر ماهواره‌ای. برای محصول نهایی شرایط استفاده را چک کنید
// یا با MapTiler / Mapbox / تایل‌های خودتان عوض کنید.
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
// ارتفاع زمین برای حالت سه‌بعدی (Terrarium، رایگان)
const TERRAIN_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [SATELLITE_TILES],
      tileSize: 256,
      maxzoom: 18,
      // attribution: "Esri, Maxar, Earthstar Geographics",
    },
    terrain: {
      type: "raster-dem",
      tiles: [TERRAIN_TILES],
      tileSize: 256,
      maxzoom: 15,
      encoding: "terrarium",
    },
    streets: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    // { id: "streets", type: "raster", source: "streets" },
    { id: "satellite", type: "raster", source: "satellite" }
    // { id: "terrain", type: "hillshade", source: "terrain" },
  ],
};

/* ------------------------------ Geo helpers ------------------------------- */

/**
 * Converts degrees to radians
 * @param d Degrees
 * @returns Radians
 */
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Calculates the area of a ring in square meters using the spherical excess formula.
 * @param ring An array of [lng, lat] coordinates representing the ring.
 * @returns The area of the ring in square meters.
 */
function ringAreaM2(ring: number[][]): number {
  const R = 6378137;
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    s += rad(x2 - x1) * (2 + Math.sin(rad(y1)) + Math.sin(rad(y2)));
  }
  return Math.abs((s * R * R) / 2);
}

/**
 * Calculates the centroid of a ring.
 * @param ring An array of [lng, lat] coordinates representing the ring.
 * @returns The centroid as [lng, lat].
 */
function centroid(ring: number[][]): [number, number] {
  const pts = ring.slice(0, -1);
  const n = pts.length || 1;
  return [
    pts.reduce((a, p) => a + p[0], 0) / n,
    pts.reduce((a, p) => a + p[1], 0) / n,
  ];
}

/**
 * Checks if a point is inside a ring.
 * @param [x, y] The point to check.
 * @param ring An array of [lng, lat] coordinates representing the ring.
 * @returns True if the point is inside the ring, false otherwise.
 */
function pointInRing([x, y]: [number, number], ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const faNum = (n: number) => n.toLocaleString("fa-IR");

/* -------------------------------- Icons ----------------------------------- */

function Icon({ d, size = 18 }: { d: string[]; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}

const ICONS = {
  pointer: [
    "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
  ],
  pen: [
    "M12 20h9",
    "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
  ],
  square: [
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  ],
  trash: [
    "M3 6h18",
    "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
    "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
  ],
  layers: [
    "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
    "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
    "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
  ],
  locate: ["M3 11 22 2l-9 19-2-8z"],
  plus: ["M5 12h14", "M12 5v14"],
  minus: ["M5 12h14"],
};

/* ------------------------------- Component -------------------------------- */

const MapEditor = forwardRef<MapEditorHandle, MapEditorProps>(
  function MapEditor(
    {
      center = [59.679098, 36.211555],
      zoom = 13.5,
      initialData,
      onChange,
      className = "",
    },
    ref,
  ) {
    const mapEl = useRef<HTMLDivElement>(null);
    const miniEl = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<TerraDraw | null>(null);
    const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
    const metaRef = useRef<Map<string, { level: Level; name: string }>>(
      new Map(),
    );
    const counterRef = useRef<Record<Level, number>>({
      region: 0,
      block: 0,
      parcel: 0,
    });
    const levelRef = useRef<Level>("parcel");
    const selectedRef = useRef<string | null>(null);
    const onChangeRef = useRef(onChange);
    const syncRef = useRef<(emit: boolean) => AreaCollection>(() => ({
      type: "FeatureCollection",
      features: [],
    }));

    const [tool, setTool] = useState<Tool>("select");
    const [level, setLevel] = useState<Level>("parcel");
    const [levelMenu, setLevelMenu] = useState(false);
    const [is3D, setIs3D] = useState(false);
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      levelRef.current = level;
    }, [level]);

    /* ---- نقشه + ابزار رسم ---- */
    useEffect(() => {
      if (!mapEl.current || mapRef.current) return;
      const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name) as HexColor;
      const map = new maplibregl.Map({
        container: mapEl.current,
        style: mapStyle,
        center,
        zoom,
        pitch: 60,
        bearing: -15,
        maxPitch: 80,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.on("rotate", () => setBearing(map.getBearing()));

      // مینی‌مپ
      const mini = miniEl.current
        ? new maplibregl.Map({
            container: miniEl.current,
            style: {
              version: 8,
              sources: mapStyle.sources,
              layers: mapStyle.layers,
            } as maplibregl.StyleSpecification,
            center,
            zoom: Math.max(zoom - 4, 0),
            interactive: false,
            attributionControl: false,
          })
        : null;
      const syncMini = () =>
        mini?.jumpTo({
          center: map.getCenter(),
          zoom: Math.max(map.getZoom() - 4, 0),
          bearing: map.getBearing(),
        });
      map.on("move", syncMini);

      // رنگ هر شکل بر اساس سطحش (منطقه/بلوک/قطعه)
      const colorOf = (f: { id?: string | number }): HexColor =>
        getCssVar(LEVELS[metaRef.current.get(String(f.id))?.level ?? levelRef.current]
          .color);
      const polyStyles = {
        fillColor: "#facc15" as HexColor,
        fillOpacity: 0.3,
        outlineColor: "#facc15" as HexColor,
        outlineWidth: 2,
      };

      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [
          new TerraDrawSelectMode({
            flags: {
              polygon: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              rectangle: {
                feature: {
                  draggable: true,
                  coordinates: { resizable: "opposite", draggable: false },
                },
              },
            },
            styles: {
              selectedPolygonColor: (feature) => {
                const level = metaRef.current.get(String(feature.id))?.level;
                if (!level) return getCssVar(SELECTED_COLOR);
                switch (level) {
                  case "region":
                    return "#22c55e";
                  case "block":
                    return "#3b82f6";
                  case "parcel":
                    return "#facc15";
                }
              },
              
              selectedPolygonFillOpacity: 0.35,
              selectedPolygonOutlineColor: getCssVar(SELECTED_COLOR),
              selectedPolygonOutlineWidth: 3,
              selectionPointColor: "#ffffff",
              selectionPointOutlineColor: getCssVar(SELECTED_COLOR),
              midPointColor: getCssVar(SELECTED_COLOR),
              midPointOutlineColor: "#ffffff",
            },
          }),
          new TerraDrawPolygonMode({
            styles: {...polyStyles, fillColor: (feature) => colorOf(feature), outlineColor: (feature) => colorOf(feature)},
            keyEvents: { finish: "Enter", cancel: "Escape" },
          }),
          new TerraDrawRectangleMode({ styles: polyStyles }),
        ],
        undoRedo: {
          // Undo/Redo while drawing a polygon
          modeLevel: new TerraDrawModeUndoRedo({
            maxStackSize: 100,
          }),

          // Undo/Redo completed operations
          sessionLevel: new TerraDrawSessionUndoRedo({
            maxStackSize: 100,
          }),

          // Keyboard shortcuts
          keyboardShortcuts: new TerraDrawUndoRedoKeyboardShortcuts(),
        },
      });
      drawRef.current = draw;

      /* همگام‌سازی: برچسب‌ها، parent، مساحت و خروجی GeoJSON */
      const sync = (emit: boolean): AreaCollection => {
        /**
         * Filters the TerraDraw snapshot to include only polygon features that have associated metadata.
         * @param draw The TerraDraw instance.
         */
        const snap = draw
          .getSnapshot()
          .filter(
            (f) =>
              f.geometry.type === "Polygon" &&
              metaRef.current.has(String(f.id)),
          );

        /**
         * Maps the features from the TerraDraw snapshot to a structured format with metadata and geometry.
         * @param snap The snapshot of features from TerraDraw.
         * @returns An array of items containing id, metadata, ring coordinates, and geometry.
         */
        const items = snap.map((f) => {
          const id = String(f.id);
          const meta = metaRef.current.get(id)!;
          const ring = (f.geometry as { coordinates: number[][][] })
            .coordinates[0];
          return {
            id,
            meta,
            ring,
            geometry: f.geometry as AreaFeature["geometry"],
          };
        });

        /**
         * Finds the parent ID of a given item based on its level and position.
         * @param it  The item for which to find the parent.
         * @returns  The ID of the parent item if found, otherwise null.
         */
        const parentOf = (it: (typeof items)[number]): string | null => {
          const c = centroid(it.ring);
          const parentLevels: Level[] =
            it.meta.level === "parcel"
              ? ["block", "region"]
              : it.meta.level === "block"
                ? ["region"]
                : [];
          for (const lv of parentLevels) {
            const p = items.find(
              (o) => o.meta.level === lv && pointInRing(c, o.ring),
            );
            if (p) return p.id;
          }
          return null;
        };

        // مارکرهای برچسب
        /**
         * Updates the markers on the map based on the current items, adding new markers for new items and removing markers for deleted items.
         */
        const alive = new Set(items.map((i) => i.id));
        markersRef.current.forEach((m, id) => {
          if (!alive.has(id)) {
            m.remove();
            markersRef.current.delete(id);
          }
        });

        /**
         * Updates or creates markers for each item, setting their position and label based on the item's metadata and level.
         */
        items.forEach((it) => {
          const pos = centroid(it.ring);
          let m = markersRef.current.get(it.id);
          if (!m) {
            const el = document.createElement("div");
            el.dir = "rtl";
            el.className =
              "pointer-events-none whitespace-nowrap rounded-md bg-[#0b2a4a]/90 px-2.5 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10 font-[Vazirmatn]";
            m = new maplibregl.Marker({ element: el })
              .setLngLat(pos)
              .addTo(map);
            markersRef.current.set(it.id, m);
          }
          m.setLngLat(pos);
          m.getElement().textContent = it.meta.name;
          m.getElement().style.display =
            it.meta.level === "parcel" ? "none" : "block";
        });

        const fc: AreaCollection = {
          type: "FeatureCollection",
          features: items.map((it) => ({
            type: "Feature",
            id: it.id,
            geometry: it.geometry,
            properties: {
              id: it.id,
              level: it.meta.level,
              name: it.meta.name,
              parentId: parentOf(it),
              areaHa: Math.round((ringAreaM2(it.ring) / 10000) * 1000) / 1000,
            },
          })),
        };
        if (emit) onChangeRef.current?.(fc);
        return fc;
      };
      syncRef.current = sync;

      draw.on("select", (id) => {
        selectedRef.current = String(id);
      });
      draw.on("deselect", () => {
        selectedRef.current = null;
      });
      draw.on("change", (_ids, type) => {
        if (type === "delete") {
          _ids.forEach((id) => metaRef.current.delete(String(id)));
          sync(true);
        } else if (type === "update") {
          sync(false); // موقع درگ فقط برچسب‌ها جابه‌جا می‌شوند
        }
      });
      draw.on("finish", (id, context) => {
        const key = String(id);
        if (context.action === "draw" && !metaRef.current.has(key)) {
          const lv = levelRef.current;
          counterRef.current[lv] += 1;
          metaRef.current.set(key, {
            level: lv,
            name: `${LEVELS[lv].label} ${faNum(counterRef.current[lv])}`,
          });
          sync(true);
          // بعد از کشیدن، شکل را انتخاب کن تا بشود ویرایشش کرد
          draw.setMode("select");
          map.doubleClickZoom.enable();
          draw.selectFeature(id);
          setTool("select");
        } else {
          sync(true);
        }
      });

      map.on("load", () => {
        map.setTerrain({ source: "terrain", exaggeration: 1.3 });
        draw.start();
        draw.setMode("select");

        if (initialData?.features.length) {
          const results = draw.addFeatures(
            initialData.features.map((f) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id: _drop, ...rest } = f as AreaFeature & { id?: string };
              const isUuid =
                typeof f.id === "string" && /^[0-9a-f-]{36}$/i.test(f.id);
              return {
                ...(isUuid ? { id: f.id } : {}),
                ...rest,
                properties: { ...f.properties, mode: "polygon" },
              };
            }) as never,
          );
          results.forEach((r, i) => {
            if (!r.valid || r.id === undefined) return;
            const p = initialData.features[i].properties;
            const lv = p.level ?? "parcel";
            metaRef.current.set(String(r.id), { level: lv, name: p.name });
            counterRef.current[lv] += 1;
          });
          sync(false);

          const coords = initialData.features.flatMap(
            (f) => f.geometry.coordinates[0],
          );
          const b = new maplibregl.LngLatBounds(
            coords[0] as [number, number],
            coords[0] as [number, number],
          );
          coords.forEach((c) => b.extend(c as [number, number]));
          map.fitBounds(b, { padding: 80, duration: 0 });
        }
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        // eslint-disable-next-line react-hooks/exhaustive-deps
        markersRef.current.clear();
        try {
          draw.stop();
        } catch {
          /* map ممکن است قبلاً destroy شده باشد */
        }
        mini?.remove();
        map.remove();
        mapRef.current = null;
        drawRef.current = null;
      };
      // فقط یک بار موقع mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---- 3D ---- */
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const apply = () => {
        if (is3D) {
          map.setTerrain({ source: "terrain", exaggeration: 1.3 });
          map.easeTo({ pitch: 60, duration: 600 });
        } else {
          map.setTerrain(null);
          map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
        }
      };
      if (map.isStyleLoaded()) apply();
      else map.once("load", apply);
    }, [is3D]);

    /* ---- API بیرونی ---- */
    useImperativeHandle(ref, () => ({
      getGeoJSON: () => syncRef.current(false),
      clear: () => {
        drawRef.current?.clear();
        metaRef.current.clear();
        counterRef.current = { region: 0, block: 0, parcel: 0 };
        syncRef.current(true);
      },
    }));

    /* ---- Actions ---- */
    const chooseTool = useCallback((t: Tool) => {
      drawRef.current?.setMode(t);
      if (t === "polygon") {
        mapRef.current?.doubleClickZoom.disable();
      } else {
        mapRef.current?.doubleClickZoom.enable();
      }
      setTool(t);
      setLevelMenu(false);
    }, []);

    const deleteSelected = useCallback(() => {
      const id = selectedRef.current;
      if (!id) return;
      drawRef.current?.removeFeatures([id]);
      selectedRef.current = null;
    }, []);

    const locate = useCallback(() => {
      navigator.geolocation?.getCurrentPosition((p) =>
        mapRef.current?.flyTo({
          center: [p.coords.longitude, p.coords.latitude],
          zoom: 16,
        }),
      );
    }, []);

    const btn = (active: boolean) =>
      `flex h-9 w-9 items-center justify-center rounded-lg transition-color aria-pressed:bg-(--level-color) aria-pressed:text-background hover:bg-white/10 hover:text-white`;
    const floatBtn =
      "flex h-9 w-9 items-center justify-center rounded-lg bg-[#0e1726]/95 text-slate-200 ring-1 ring-white/10 hover:bg-[#16233a]";

    return (
      <div
        dir="ltr"
        className={`relative h-full min-h-105 w-full overflow-hidden bg-[#0e1726] ${className}`}
      >
        <div className="absolute inset-0">
          <div ref={mapEl} className="h-full w-full" />
        </div>

        {/* نوار ابزار */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-xl bg-[#0e1726]/95 p-1.5 ring-1 ring-white/10"
        
         style={{"--level-color": `var(${LEVELS[level].color})`} as React.CSSProperties}
        >
          <button
            className={btn(tool === "select")}
            aria-pressed={tool === "select"}
            onClick={() => chooseTool("select")}
            title="انتخاب و ویرایش"
          >
            <Icon d={ICONS.pointer} />
          </button>
          <button
            className={btn(tool === "polygon")}
            aria-pressed={tool === "polygon"}
            onClick={() => chooseTool("polygon")}
            title="کشیدن چندضلعی (کلیک روی نقطه شروع یا Enter برای پایان)"
          >
            <Icon d={ICONS.pen} />
          </button>
          <button
            className={btn(tool === "rectangle")}
            aria-pressed={tool === "rectangle"}
            onClick={() => chooseTool("rectangle")}
            title="کشیدن مستطیل"
          >
            <Icon d={ICONS.square} />
          </button>
          <button
            className={btn(false)}
            onClick={deleteSelected}
            title="حذف شکل انتخاب‌شده"
          >
            <Icon d={ICONS.trash} />
          </button>
          <button
            className={btn(levelMenu)}
            aria-pressed={levelMenu}
            onClick={() => setLevelMenu((v) => !v)}
            title="سطح (منطقه / بلوک / قطعه)"
          >
            <Icon d={ICONS.layers} />
          </button>
        </div>

        {levelMenu && (
          <div
            dir="rtl"
            className=" absolute left-16 top-3 z-10 w-36 rounded-xl bg-[#0e1726]/95 p-1.5 text-sm text-slate-200 ring-1 ring-white/1 flex flex-col gap-1.5"
          >
            {(Object.keys(LEVELS) as Level[]).map((lv) => (
              <button
                key={lv}
                onClick={() => {
                  setLevel(lv);
                  setLevelMenu(false);
                }}
                className={`flex w-full items-center gap-2 transition duration-300 rounded-lg px-2.5 py-2 text-right hover:bg-white/10 ${
                  level === lv ? "bg-white/10" : ""
                }`}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ background: `var(${LEVELS[lv].color})` }}
                />
                {LEVELS[lv].label}
              </button>
            ))}
          </div>
        )}

        {/* کنترل‌های سمت راست */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button className={`${floatBtn} transition duration-300`} onClick={locate} title="موقعیت من">
            <Icon d={ICONS.locate} />
          </button>
          <button
            className={`${floatBtn} transition duration-300`}
            onClick={() => mapRef.current?.zoomIn()}
            title="بزرگ‌نمایی"
          >
            <Icon d={ICONS.plus} />
          </button>
          <button
            className={`${floatBtn} transition duration-300`}
            onClick={() => mapRef.current?.zoomOut()}
            title="کوچک‌نمایی"
          >
            <Icon d={ICONS.minus} />
          </button>
          <button
            className={`${floatBtn}transition duration-300 rounded-full`}
            onClick={() =>
              mapRef.current?.easeTo({ bearing: 0, pitch: is3D ? 60 : 0 })
            }
            title="رو به شمال"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{
                transform: `rotate(${-bearing}deg)`,
                transition: "transform .1s",
              }}
              aria-hidden
            >
              <path d="M12 3 16 13H8z" fill="#ef4444" />
              <path d="M12 21 8 13h8z" fill="#94a3b8" />
            </svg>
          </button>
        </div>

        {/* مینی‌مپ */}
        <div className="absolute bottom-3 left-3 z-10 h-28 w-28 overflow-hidden rounded-xl ring-2 ring-[#0e1726]">
          <div ref={miniEl} className="h-full w-full" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 ring-2 ring-white" />
        </div>

        {/* سوییچ 3D پایین راست */}
        <button
          onClick={() => setIs3D((v) => !v)}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-2.5 rounded-full bg-[#0e1726]/95 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
          aria-pressed={is3D}
        >
          3D
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              is3D ? "bg-blue-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                is3D ? "left-5.5" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    );
  },
);

export default MapEditor;
