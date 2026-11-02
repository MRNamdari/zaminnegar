"use client";

import { useCallback, useContext, useRef } from "react";

import { MapEditorInternalContext } from "../context/MapEditorContext";

import {
  useMapEditorActions,
  useMapEditorState,
} from "../context/useMapEditor";

import { useMapEngine } from "../hooks/useMapEngine";

import type { AreaCollection, MapEngine } from "../types";
import { TerraDrawEventListeners } from "terra-draw";

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
  const actions = useMapEditorActions();

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

  const handleFinish = useCallback<TerraDrawEventListeners["finish"]>(
    (feat, ctx) => {
      console.log("Finish event triggered:", feat, ctx);
      actions.setActiveTool("select");
    },
    [actions],
  );

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
    onFinish: handleFinish,
    onReady: handleReady,
    resetBearing: () => {
      internal.setBearing(0);
    },
  });

  return <div ref={mapElement} className="absolute inset-0 h-full w-full" />;
}
