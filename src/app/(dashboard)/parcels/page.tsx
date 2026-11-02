"use client";
import {
  MapEditorProvider,
  MapEditor,
  useMapEditor,
} from "@/app/features/map-editor";

export default function MapPage() {
  return (
    <MapEditorProvider
      onChange={(geojson) => {
        console.log("Map updated:", geojson);
      }}
    >
      <div className="h-175">
        <MapEditor />
      </div>
    </MapEditorProvider>
  );
}
