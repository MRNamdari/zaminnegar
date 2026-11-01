"use client";
import {
  MapEditorProvider,
  MapEditor,
  useMapEditor,
} from "@/app/features/map-editor";

function ExternalToolbar() {
  const { state, actions } = useMapEditor();

  return (
    <div className="flex gap-2">
      <button onClick={() => actions.setActiveTool("polygon")}>Draw</button>

      <button onClick={actions.undo}>Undo</button>

      <button onClick={actions.redo}>Redo</button>

      <button onClick={actions.clear}>Clear</button>

      <span>{state.features.features.length} features</span>
    </div>
  );
}

export default function MapPage() {
  return (
    <MapEditorProvider
      onChange={(geojson) => {
        console.log("Map updated:", geojson);
      }}
    >
      <ExternalToolbar />

      <div className="h-175">
        <MapEditor />
      </div>
    </MapEditorProvider>
  );
}
