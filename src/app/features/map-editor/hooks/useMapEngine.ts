"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";

import maplibregl from "maplibre-gl";
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  TerraDrawModeUndoRedo,
  TerraDrawSessionUndoRedo,
  TerraDrawUndoRedoKeyboardShortcuts,
  type HexColor,
  type TerraDrawEventListeners,
} from "terra-draw";

import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

import { mapStyle, TERRAIN_TILES } from "../config/mapStyle";
import { LEVELS, SELECTED_COLOR } from "../config/levels";

import {
  centroid,
  findParent,
  formatFaNumber,
  ringAreaM2,
} from "../services/geoUtils";

import { MarkerManager } from "../services/markerManager";

import type {
  AreaCollection,
  AreaFeature,
  Level,
  MapEngine,
  MapEditorProps,
  Tool,
} from "../types";

interface Options {
  container: RefObject<HTMLDivElement | null>;
  miniContainer: RefObject<HTMLDivElement | null>;
  center: [number, number];
  zoom: number;
  initialData?: AreaCollection;
  activeLevel: Level;
  onFeaturesChange: (data: AreaCollection, emit: boolean) => void;
  onSelectedChange: (id: string | null) => void;
  onFinish: TerraDrawEventListeners["finish"];
  onBearingChange: (bearing: number) => void;
  onReady: (engine: MapEngine | null) => void;
  resetBearing: () => void;
}

const emptyCollection = (): AreaCollection => ({
  type: "FeatureCollection",
  features: [],
});

export function useMapEngine({
  container,
  miniContainer,
  center,
  zoom,
  initialData,
  activeLevel,
  onFeaturesChange,
  onSelectedChange,
  onFinish,
  onBearingChange,
  onReady,
  resetBearing,
}: Options) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<TerraDraw | null>(null);
  const markerRef = useRef<MarkerManager | null>(null);

  const metaRef = useRef(new Map<string, { level: Level; name: string }>());

  const countersRef = useRef<Record<Level, number>>({
    region: 0,
    block: 0,
    parcel: 0,
  });

  const selectedRef = useRef<string | null>(null);
  const activeLevelRef = useRef(activeLevel);
  const initialDataRef = useRef(initialData);
  const callbacksRef = useRef({
    onFeaturesChange,
    onSelectedChange,
    onBearingChange,
    onReady,
    resetBearing,
    onFinish,
  });

  useEffect(() => {
    callbacksRef.current = {
      onFeaturesChange,
      onSelectedChange,
      onBearingChange,
      onReady,
      resetBearing,
      onFinish,
    };
    activeLevelRef.current = activeLevel;
    initialDataRef.current = initialData;
  }, [
    activeLevel,
    initialData,
    onBearingChange,
    onFeaturesChange,
    onReady,
    onSelectedChange,
    resetBearing,
  ]);

  const sync = useCallback((emit: boolean): AreaCollection => {
    const draw = drawRef.current;
    const map = mapRef.current;

    if (!draw || !map) return emptyCollection();

    const items = draw
      .getSnapshot()
      .filter(
        (feature) =>
          feature.geometry.type === "Polygon" &&
          metaRef.current.has(String(feature.id)),
      )
      .map((feature) => {
        const id = String(feature.id);
        const meta = metaRef.current.get(id)!;
        const geometry = feature.geometry as AreaFeature["geometry"];

        return {
          id,
          meta,
          geometry,
          ring: geometry.coordinates[0],
        };
      });

    markerRef.current?.sync(
      items.map((item) => ({
        id: item.id,
        name: item.meta.name,
        level: item.meta.level,
        ring: item.ring,
      })),
    );

    const hierarchyItems = items.map((item) => ({
      id: item.id,
      level: item.meta.level,
      ring: item.ring,
    }));

    const collection: AreaCollection = {
      type: "FeatureCollection",
      features: items.map((item) => ({
        type: "Feature",
        id: item.id,
        geometry: item.geometry,
        properties: {
          id: item.id,
          level: item.meta.level,
          name: item.meta.name,
          parentId: findParent(item.meta.level, item.ring, hierarchyItems),
          areaHa: Math.round((ringAreaM2(item.ring) / 10000) * 1000) / 1000,
        },
      })),
    };

    callbacksRef.current.onFeaturesChange(collection, emit);

    return collection;
  }, []);

  const setTool = useCallback((tool: Tool) => {
    drawRef.current?.setMode(tool);

    const map = mapRef.current;

    if (tool === "polygon") {
      map?.doubleClickZoom.disable();
    } else {
      map?.doubleClickZoom.enable();
    }
  }, []);

  const clear = useCallback(() => {
    drawRef.current?.clear();
    metaRef.current.clear();

    countersRef.current = {
      region: 0,
      block: 0,
      parcel: 0,
    };

    selectedRef.current = null;
    callbacksRef.current.onSelectedChange(null);

    sync(true);
  }, [sync]);

  const selectFeature = useCallback((id: string | null) => {
    const draw = drawRef.current;
    if (!draw) return;

    if (!id) {
      selectedRef.current = null;
      draw.setMode("select");
      callbacksRef.current.onSelectedChange(null);
      return;
    }

    const exists = draw
      .getSnapshot()
      .some((feature) => String(feature.id) === id);

    if (!exists) return;

    draw.setMode("select");
    draw.selectFeature(id);

    selectedRef.current = id;
    callbacksRef.current.onSelectedChange(id);
  }, []);

  const deleteSelectedFeature = useCallback(() => {
    const id = selectedRef.current;
    if (!id) return;

    drawRef.current?.removeFeatures([id]);
    metaRef.current.delete(id);

    selectedRef.current = null;
    callbacksRef.current.onSelectedChange(null);
    sync(true);
  }, [sync]);

  const set3D = useCallback((enabled: boolean) => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      if (enabled) {
        map.setTerrain({
          source: "terrain",
          exaggeration: 1.3,
        });
        map.easeTo({ pitch: 60, duration: 600 });
      } else {
        map.setTerrain(null);
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 600,
        });
      }
    };

    if (map.isStyleLoaded()) {
      apply();
    } else {
      map.once("load", apply);
    }
  }, []);

  const getGeoJSON = useCallback(() => sync(false), [sync]);

  const engineRef = useRef<MapEngine | null>(null);

  useEffect(() => {
    const mapContainer = container.current;
    const miniMapContainer = miniContainer.current;

    if (!mapContainer) return;

    let disposed = false;
    let mini: maplibregl.Map | null = null;

    const map = new maplibregl.Map({
      container: mapContainer,
      style: mapStyle,
      center,
      zoom,
      pitch: 0,
      bearing: 0,
      maxPitch: 80,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    markerRef.current = new MarkerManager(map);

    map.on("rotate", () => {
      callbacksRef.current.onBearingChange(map.getBearing());
    });

    if (miniMapContainer) {
      mini = new maplibregl.Map({
        container: miniMapContainer,
        style: mapStyle,
        center,
        zoom: Math.max(zoom - 4, 0),
        interactive: false,
        attributionControl: false,
      });

      map.on("move", () => {
        mini?.jumpTo({
          center: map.getCenter(),
          zoom: Math.max(map.getZoom() - 4, 0),
          bearing: map.getBearing(),
        });
      });
    }

    const getCssVar = (name: string) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() as HexColor;

    const colorOf = (feature: { id?: string | number }) =>
      getCssVar(
        LEVELS[
          metaRef.current.get(String(feature.id))?.level ??
            activeLevelRef.current
        ].color,
      );

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
                coordinates: {
                  resizable: "opposite",
                  draggable: false,
                },
              },
            },
          },
          styles: {
            selectedPolygonColor: (feature) => {
              const level = metaRef.current.get(String(feature.id))?.level;

              if (level === "region") return "#22c55e";
              if (level === "block") return "#3b82f6";
              if (level === "parcel") return "#facc15";

              return getCssVar(SELECTED_COLOR);
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
          styles: {
            ...polyStyles,
            fillColor: colorOf,
            outlineColor: colorOf,
          },
          keyEvents: {
            finish: "Enter",
            cancel: "Escape",
          },
        }),

        new TerraDrawRectangleMode({
          styles: polyStyles,
        }),
      ],
      undoRedo: {
        modeLevel: new TerraDrawModeUndoRedo({
          maxStackSize: 100,
        }),
        sessionLevel: new TerraDrawSessionUndoRedo({
          maxStackSize: 100,
        }),
        keyboardShortcuts: new TerraDrawUndoRedoKeyboardShortcuts(),
      },
    });

    drawRef.current = draw;

    draw.on("select", (id) => {
      const key = String(id);
      selectedRef.current = key;
      callbacksRef.current.onSelectedChange(key);
    });

    draw.on("deselect", () => {
      selectedRef.current = null;
      callbacksRef.current.onSelectedChange(null);
    });

    draw.on("change", (ids, type) => {
      if (type === "delete") {
        ids.forEach((id) => {
          metaRef.current.delete(String(id));

          if (selectedRef.current === String(id)) {
            selectedRef.current = null;
            callbacksRef.current.onSelectedChange(null);
          }
        });

        sync(true);
      } else if (type === "update") {
        sync(false);
      }
    });

    draw.on("finish", (id, context) => {
      const key = String(id);
      onFinish(id, context);
      if (context.action === "draw" && !metaRef.current.has(key)) {
        const level = activeLevelRef.current;

        countersRef.current[level] += 1;

        metaRef.current.set(key, {
          level,
          name:
            `${LEVELS[level].label} ` +
            formatFaNumber(countersRef.current[level]),
        });

        sync(true);
        setTool("select");
        draw.setMode("select");
        map.doubleClickZoom.enable();
        draw.selectFeature(id);
      } else {
        sync(true);
      }
    });

    const engine: MapEngine = {
      map,
      draw,
      getGeoJSON,
      clear,
      setTool,
      selectFeature,
      deleteSelectedFeature,
      undo: () => draw.undo(),
      redo: () => draw.redo(),
      flyTo: (coordinates, targetZoom = 16) =>
        map.flyTo({
          center: coordinates,
          zoom: targetZoom,
        }),
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      set3D,
      resetBearing: () => {
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 600,
        });
      },
    };

    engineRef.current = engine;

    map.once("load", () => {
      if (disposed) return;

      map.setTerrain({
        source: "terrain",
        exaggeration: 1.3,
      });

      draw.start();
      draw.setMode("select");

      const data = initialDataRef.current;

      if (data?.features.length) {
        const results = draw.addFeatures(
          data.features.map((feature) => {
            const { id: _ignored, ...rest } = feature;

            const validUuid =
              typeof feature.id === "string" &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                feature.id,
              );

            return {
              ...(validUuid ? { id: feature.id } : {}),
              ...rest,
              properties: {
                ...feature.properties,
                mode: "polygon",
              },
            };
          }) as never,
        );

        results.forEach((result, index) => {
          if (!result.valid || result.id === undefined) return;

          const feature = data.features[index];
          const level = feature.properties.level ?? "parcel";

          metaRef.current.set(String(result.id), {
            level,
            name: feature.properties.name,
          });

          countersRef.current[level] += 1;
        });

        sync(false);

        const coordinates = data.features.flatMap(
          (feature) => feature.geometry.coordinates[0],
        );

        if (coordinates.length) {
          const bounds = new maplibregl.LngLatBounds(
            coordinates[0] as [number, number],
            coordinates[0] as [number, number],
          );

          coordinates.forEach((coordinate) =>
            bounds.extend(coordinate as [number, number]),
          );

          map.fitBounds(bounds, {
            padding: 80,
            duration: 0,
          });
        }
      }

      callbacksRef.current.onReady(engine);
    });

    return () => {
      disposed = true;

      callbacksRef.current.onReady(null);

      markerRef.current?.clear();
      markerRef.current = null;

      try {
        draw.stop();
      } catch {
        // The map may already have been destroyed.
      }

      mini?.remove();
      map.remove();

      mapRef.current = null;
      drawRef.current = null;
      engineRef.current = null;
    };
  }, []);

  return {
    mapRef,
    drawRef,
    sync,
  };
}
