'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState } from 'react';
import MapGL, { type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { toast } from 'sonner';
import { useParcels } from '@/features/parcels/hooks/use-parcels';
import { useDrawing } from '@/features/workspace/context/drawing-context';
import { useWorkspace } from '@/features/workspace/context/workspace-context';
import { fa } from '@/messages/fa';
import { PARCEL_FILL_LAYER_ID } from '../config/map-layers';
import { useDrawingShortcuts } from '../hooks/use-drawing-shortcuts';
import { useFinishDrawing } from '../hooks/use-finish-drawing';
import { useFitProjectExtent } from '../hooks/use-fit-project-extent';
import { useVertexEditor } from '../hooks/use-vertex-editor';
import { toMultiPolygon } from '../lib/geometry';
import type { MapConfig, Position } from '../types';
import { BasemapLayers } from './basemap-layers';
import { DraftLayers } from './draft-layers';
import { ParcelLayers } from './parcel-layers';
import { VertexMarkers } from './vertex-markers';

/** Clicking within this many pixels of the first vertex closes the polygon. */
const CLOSE_RADIUS_PX = 12;
/** Ignores the second click of a double-click so no duplicate vertex is added. */
const DUPLICATE_RADIUS_PX = 4;

const BACKGROUND_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [{ id: 'background', type: 'background' as const, paint: { 'background-color': '#1d2b24' } }],
};

/**
 * The interactive map: basemap, saved parcels, the polygon being drawn and vertex handles.
 * All coordinates come from MapLibre's own pointer → geographic conversion (`event.lngLat`).
 */
export function InteractiveMap({ config }: { config: MapConfig }) {
  const { projectId, mode, basemap, selectedParcelId, selectParcel } = useWorkspace();
  const { vertices, addVertex } = useDrawing();
  const { data: parcels = [] } = useParcels(projectId);
  const finishDrawing = useFinishDrawing();
  const [pointer, setPointer] = useState<Position | null>(null);
  const [hoveringParcel, setHoveringParcel] = useState(false);

  const selectedParcel = parcels.find((parcel) => parcel.id === selectedParcelId);
  const editor = useVertexEditor(projectId, mode === 'edit' ? selectedParcel : undefined);
  const geometryOverride = useMemo(
    () => (mode === 'edit' && selectedParcel && editor.rings.length > 0 ? { parcelId: selectedParcel.id, geometry: toMultiPolygon(editor.rings) } : undefined),
    [mode, selectedParcel, editor.rings],
  );

  useFitProjectExtent(projectId);
  useDrawingShortcuts(() => void finishDrawing());
  useEffect(() => {
    if (config.imageryFallback) toast.info(fa.map.imageryFallbackNotice);
  }, [config.imageryFallback]);

  const handleClick = (event: MapLayerMouseEvent) => {
    if (mode !== 'draw') {
      const id = event.features?.[0]?.properties?.id;
      selectParcel(typeof id === 'string' ? id : null);
      return;
    }
    const { lng, lat } = event.lngLat.wrap();
    const near = (target: Position, radius: number) => {
      const projected = event.target.project(target);
      return Math.hypot(projected.x - event.point.x, projected.y - event.point.y) <= radius;
    };
    if (vertices.length >= 3 && near(vertices[0], CLOSE_RADIUS_PX)) return void finishDrawing();
    if (vertices.length > 0 && near(vertices[vertices.length - 1], DUPLICATE_RADIUS_PX)) return;
    addVertex([lng, lat]);
  };

  const cursor = mode === 'draw' ? 'crosshair' : hoveringParcel ? 'pointer' : undefined;

  return (
    <MapGL
      initialViewState={{ longitude: config.defaultCenter[0], latitude: config.defaultCenter[1], zoom: config.defaultZoom }}
      mapStyle={BACKGROUND_STYLE}
      maxZoom={21}
      maxPitch={0}
      dragRotate={false}
      doubleClickZoom={mode !== 'draw'}
      interactiveLayerIds={mode === 'draw' ? [] : [PARCEL_FILL_LAYER_ID]}
      cursor={cursor}
      onClick={handleClick}
      onMouseMove={(event) => {
        if (mode === 'draw' && vertices.length > 0) setPointer([event.lngLat.lng, event.lngLat.lat]);
        setHoveringParcel(mode !== 'draw' && (event.features?.length ?? 0) > 0);
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <BasemapLayers satellite={config.imagery} basemap={basemap} />
      <ParcelLayers parcels={parcels} selectedParcelId={selectedParcelId} geometryOverride={geometryOverride} />
      {mode === 'draw' && <DraftLayers vertices={vertices} pointer={pointer} />}
      {mode === 'edit' && selectedParcel && <VertexMarkers editor={editor} />}
    </MapGL>
  );
}
