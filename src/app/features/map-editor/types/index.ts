import type maplibregl from "maplibre-gl";
import type { TerraDraw } from "terra-draw";

export type Level = "region" | "block" | "parcel";
export type Tool = "select" | "polygon" | "rectangle";

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
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: AreaProperties;
}

export interface AreaCollection {
  type: "FeatureCollection";
  features: AreaFeature[];
}

export interface MapEditorProps {
  center?: [number, number];
  zoom?: number;
  initialData?: AreaCollection;
  onChange?: (data: AreaCollection) => void;
  className?: string;
}

export interface MapEditorHandle {
  getGeoJSON: () => AreaCollection;
  clear: () => void;
}

export interface MapEditorState {
  features: AreaCollection;
  selectedFeatureId: string | null;
  activeTool: Tool;
  activeLevel: Level;
  is3D: boolean;
  bearing: number;
  isMapReady: boolean;
}

export interface MapEngine {
  map: maplibregl.Map;
  draw: TerraDraw;
  getGeoJSON: () => AreaCollection;
  clear: () => void;
  setTool: (tool: Tool) => void;
  selectFeature: (id: string | null) => void;
  deleteSelectedFeature: () => void;
  undo: () => void;
  redo: () => void;
  flyTo: (coordinates: [number, number], zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  set3D: (enabled: boolean) => void;
  resetBearing: () => void;
}
