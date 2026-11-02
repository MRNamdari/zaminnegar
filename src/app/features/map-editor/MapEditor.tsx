"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMapEditor } from "./context/useMapEditor";

import MapCanvas from "./components/MapCanvas";
import { MapToolbar } from "./components/MapToolbar";
import { MapControls } from "./components/MapControls";
import { ViewModeToggle } from "./components/ViewModeToggle";

import type { MapEditorHandle, MapEditorProps } from "./types";
import { MiniMap } from "./components/MiniMap";

const DEFAULT_CENTER: [number, number] = [59.679098, 36.211555];

const MapEditor = forwardRef<MapEditorHandle, MapEditorProps>(
  function MapEditor(
    { center = DEFAULT_CENTER, zoom = 13.5, initialData, className = "" },
    ref,
  ) {
    const { state, actions } = useMapEditor();
    const miniContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        getGeoJSON: actions.getGeoJSON,
        clear: actions.clear,
      }),
      [actions],
    );

    return (
      <div
        dir="ltr"
        className={`relative h-full min-h-105 w-full overflow-hidden bg-[#0e1726] ${className}`}
      >
        <MapCanvas
          center={center}
          zoom={zoom}
          initialData={initialData}
          miniContainer={miniContainerRef}
        />

        <MapToolbar />

        <MapControls />

        <MiniMap ref={miniContainerRef} />

        <ViewModeToggle />

        {!state.isMapReady && (
          <div
            dir="rtl"
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#0e1726]/50 text-sm font-semibold text-white"
          >
            {"در حال بارگذاری نقشه…"}
          </div>
        )}
      </div>
    );
  },
);

MapEditor.displayName = "MapEditor";

export default MapEditor;
