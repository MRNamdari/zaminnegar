"use client";

import { useCallback, useContext, useEffect, useRef } from "react";

import { MapEditorInternalContext } from "../context/MapEditorContext";

import { useMapEditorState } from "../context/useMapEditor";

import { useMapEngine } from "../hooks/useMapEngine";

import type { AreaCollection, MapEngine, MapEditorProps } from "../types";

interface Props {
  center: [number, number];
  zoom: number;
  initialData?: AreaCollection;
  miniContainer?: React.RefObject<HTMLDivElement | null>;
}

export default function MapCanvas({
  center,
  zoom,
  initialData,
  miniContainer,
}: Props) {
  const mapElement = useRef<HTMLDivElement>(null);

  const internal = useContext(MapEditorInternalContext);

  if (!internal) {
    throw new Error("MapCanvas must be inside MapEditorProvider");
  }

  const { activeLevel } = useMapEditorState();

  const handleFeaturesChange = useCallback(
    (data: AreaCollection, emit: boolean) => {
      internal.updateFeatures(data, emit);
    },
    [internal],
  );

  const handleSelectionChange = useCallback(
    (id: string | null) => internal.setSelected(id),
    [internal],
  );

  const handleBearingChange = useCallback(
    (bearing: number) => internal.setBearing(bearing),
    [internal],
  );

  // This callback is connected to the provider state
  // through the engine registration.
  const handleReady = useCallback(
    (engine: MapEngine | null) => {
      internal.registerEngine(engine);
    },
    [internal],
  );

  const bearingCallbackRef = useRef<((bearing: number) => void) | null>(null);

  useMapEngine({
    container: mapElement,
    miniContainer: miniContainer ?? { current: null },
    center,
    zoom,
    initialData,
    activeLevel,
    onFeaturesChange: handleFeaturesChange,
    onSelectedChange: handleSelectionChange,
    onBearingChange: handleBearingChange,
    onReady: handleReady,
    resetBearing: () => {
      internal.setBearing(0);
    },
  });

  return <div ref={mapElement} className="absolute inset-0 h-full w-full" />;
}
