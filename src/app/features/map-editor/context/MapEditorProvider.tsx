"use client";

import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import {
  MapEditorActionsContext,
  MapEditorInternalContext,
  MapEditorStateContext,
} from "./MapEditorContext";

import type {
  AreaCollection,
  Level,
  MapEditorState,
  MapEngine,
  Tool,
} from "../types";

const emptyCollection = (): AreaCollection => ({
  type: "FeatureCollection",
  features: [],
});

type Action =
  | { type: "SET_FEATURES"; payload: AreaCollection }
  | { type: "SET_TOOL"; payload: Tool }
  | { type: "SET_LEVEL"; payload: Level }
  | { type: "SET_SELECTED"; payload: string | null }
  | { type: "SET_3D"; payload: boolean }
  | { type: "SET_BEARING"; payload: number }
  | { type: "SET_READY"; payload: boolean }
  | { type: "RESET" };

const initialState: MapEditorState = {
  features: emptyCollection(),
  selectedFeatureId: null,
  activeTool: "select",
  activeLevel: "parcel",
  is3D: false,
  bearing: 0,
  isMapReady: false,
};

function reducer(state: MapEditorState, action: Action): MapEditorState {
  switch (action.type) {
    case "SET_FEATURES":
      return { ...state, features: action.payload };

    case "SET_TOOL":
      return { ...state, activeTool: action.payload };

    case "SET_LEVEL":
      return { ...state, activeLevel: action.payload };

    case "SET_SELECTED":
      return {
        ...state,
        selectedFeatureId: action.payload,
      };

    case "SET_3D":
      return { ...state, is3D: action.payload };

    case "SET_BEARING":
      return { ...state, bearing: action.payload };

    case "SET_READY":
      return { ...state, isMapReady: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface ProviderProps {
  children: ReactNode;
  initialData?: AreaCollection;
  onChange?: (data: AreaCollection) => void;
}

export function MapEditorProvider({ children, onChange }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const engineRef = useRef<MapEngine | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const registerEngine = useCallback((engine: MapEngine | null) => {
    engineRef.current = engine;
    dispatch({
      type: "SET_READY",
      payload: engine !== null,
    });
  }, []);

  const updateFeature = useCallback(
    (featureId: string, properties: Record<string, any>) =>
      engineRef.current?.draw.updateFeatureProperties(featureId, properties),
    [],
  );

  const updateFeatures = useCallback(
    (features: AreaCollection, emit = true) => {
      dispatch({
        type: "SET_FEATURES",
        payload: features,
      });

      if (emit) {
        onChangeRef.current?.(features);
      }
    },
    [],
  );

  const setActiveTool = useCallback((tool: Tool) => {
    engineRef.current?.setTool(tool);
    dispatch({ type: "SET_TOOL", payload: tool });
  }, []);

  const setActiveLevel = useCallback((level: Level) => {
    dispatch({ type: "SET_LEVEL", payload: level });
  }, []);

  const selectFeature = useCallback((id: string | null) => {
    engineRef.current?.selectFeature(id);
    dispatch({ type: "SET_SELECTED", payload: id });
  }, []);

  const deleteSelectedFeature = useCallback(() => {
    engineRef.current?.deleteSelectedFeature();
  }, []);

  const undo = useCallback(() => {
    engineRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    engineRef.current?.redo();
  }, []);

  const clear = useCallback(() => {
    engineRef.current?.clear();
  }, []);

  const set3D = useCallback((enabled: boolean) => {
    engineRef.current?.set3D(enabled);
    dispatch({ type: "SET_3D", payload: enabled });
  }, []);

  const getGeoJSON = useCallback(() => {
    return engineRef.current?.getGeoJSON() ?? emptyCollection();
  }, []);

  const flyTo = useCallback((coordinates: [number, number], zoom = 16) => {
    engineRef.current?.flyTo(coordinates, zoom);
  }, []);

  const zoomIn = useCallback(() => {
    engineRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    engineRef.current?.zoomOut();
  }, []);

  const actions = useMemo(
    () => ({
      setActiveTool,
      setActiveLevel,
      selectFeature,
      deleteSelectedFeature,
      undo,
      redo,
      clear,
      set3D,
      getGeoJSON,
      flyTo,
      zoomIn,
      zoomOut,
    }),
    [
      setActiveTool,
      setActiveLevel,
      selectFeature,
      deleteSelectedFeature,
      undo,
      redo,
      clear,
      set3D,
      getGeoJSON,
      flyTo,
      zoomIn,
      zoomOut,
    ],
  );

  const stateValue = useMemo(() => state, [state]);

  const setSelected = useCallback((id: string | null) => {
    dispatch({ type: "SET_SELECTED", payload: id });
  }, []);

  const setBearing = useCallback((bearing: number) => {
    dispatch({ type: "SET_BEARING", payload: bearing });
  }, []);

  const internalValue = useMemo(
    () => ({
      registerEngine,
      updateFeature,
      updateFeatures,
      setSelected,
      setBearing,
    }),
    [registerEngine, updateFeature, updateFeatures, setSelected, setBearing],
  );

  return (
    <MapEditorInternalContext.Provider value={internalValue}>
      <MapEditorStateContext.Provider value={stateValue}>
        <MapEditorActionsContext.Provider value={actions}>
          {children}
        </MapEditorActionsContext.Provider>
      </MapEditorStateContext.Provider>
    </MapEditorInternalContext.Provider>
  );
}
