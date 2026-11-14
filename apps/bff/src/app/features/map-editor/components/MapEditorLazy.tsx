"use client";

import dynamic from "next/dynamic";

/** Browser-only entry point: MapLibre and TerraDraw never load on the server. */
export const MapEditorLazy = dynamic(() => import("./MapEditor"), {
  ssr: false,
  loading: () => <div className="h-full min-h-105 w-full" />,
});
