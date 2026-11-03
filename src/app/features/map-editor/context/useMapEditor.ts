"use client";

import { useContext } from "react";

import {
  MapEditorActionsContext,
  MapEditorStateContext,
} from "./MapEditorContext";

export function useMapEditorState() {
  const context = useContext(MapEditorStateContext);

  if (!context) {
    throw new Error("useMapEditorState must be used inside MapEditorProvider");
  }

  return context;
}

export function useMapEditorActions() {
  const context = useContext(MapEditorActionsContext);

  if (!context) {
    throw new Error(
      "useMapEditorActions must be used inside MapEditorProvider",
    );
  }

  return context;
}

export function useMapEditor() {
  return {
    state: useMapEditorState(),
    actions: useMapEditorActions(),
  };
}
