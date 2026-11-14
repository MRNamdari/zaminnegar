"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useState, type ComponentType } from "react";
import { useEditorConfig, useViewState } from "../react/hooks";
import { MapCanvas } from "./MapCanvas";
import { MapControls } from "./MapControls";
import { MapToolbar } from "./MapToolbar";
import { MiniMap } from "./MiniMap";
import { StatusBar } from "./StatusBar";
import { ViewModeToggle } from "./ViewModeToggle";

/** Replace any piece of chrome with your own component; each reads the workspace through hooks. */
export interface MapEditorComponents {
  Toolbar: ComponentType;
  Controls: ComponentType;
  ViewModeToggle: ComponentType;
  StatusBar: ComponentType;
}

export interface MapEditorProps {
  className?: string;
  components?: Partial<MapEditorComponents>;
}

/** Must be rendered inside `FeatureWorkspaceProvider`. Holds no feature data of its own. */
export default function MapEditor({ className = "", components = {} }: MapEditorProps) {
  const { ui } = useEditorConfig();
  const { isMapReady } = useViewState();
  const [minimapElement, setMinimapElement] = useState<HTMLElement | null>(null);

  const Toolbar = components.Toolbar ?? MapToolbar;
  const Controls = components.Controls ?? MapControls;
  const Toggle = components.ViewModeToggle ?? ViewModeToggle;
  const Status = components.StatusBar ?? StatusBar;

  return (
    <div dir="ltr" className={`relative h-full min-h-105 w-full overflow-hidden ${className}`}>
      <MapCanvas minimapContainer={ui.minimap ? minimapElement : null} />
      {ui.toolbar && <Toolbar />}
      {ui.controls && <Controls />}
      {ui.minimap && <MiniMap onContainer={setMinimapElement} />}
      {ui.viewModeToggle && <Toggle />}
      {ui.statusBar && <Status />}
      {!isMapReady && (
        <div dir="rtl" className="absolute inset-0 z-30 flex items-center justify-center bg-background-hover/50 text-sm font-semibold">
          {ui.texts.loading}
        </div>
      )}
    </div>
  );
}
