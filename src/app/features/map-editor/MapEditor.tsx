"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMapEditor } from "./context/useMapEditor";

import MapCanvas from "./components/MapCanvas";
import { MapToolbar } from "./components/MapToolbar";
import { MapControls } from "./components/MapControls";
import { ViewModeToggle } from "./components/ViewModeToggle";

import type { MapEditorHandle, MapEditorProps } from "./types";

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

        <div className="absolute bottom-3 left-3 z-20 h-28 w-28 overflow-hidden rounded-xl ring-2 ring-[#0e1726]">
          <div ref={miniContainerRef} className="h-full w-full" />

          <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 ring-2 ring-white" />
        </div>

        <ViewModeToggle />

        {!state.isMapReady && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0e1726]/50 text-sm text-white">
            Loading map...
          </div>
        )}
      </div>
    );
  },
);

MapEditor.displayName = "MapEditor";

export default MapEditor;
