'use client';

import type { Feature, FeatureCollection } from 'geojson';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { draftFillLayer, draftLineLayer, draftPointLayer, SOURCE_IDS } from '../config/map-layers';
import type { Position } from '../types';

interface DraftLayersProps {
  vertices: readonly Position[];
  /** Pointer position, used to draw the rubber-band edge to the cursor. */
  pointer: Position | null;
}

/** The polygon currently being drawn: dashed outline, translucent fill and vertex dots. */
export function DraftLayers({ vertices, pointer }: DraftLayersProps) {
  const { shape, points } = useMemo(() => {
    const path = pointer ? [...vertices, pointer] : [...vertices];
    const shapeFeatures: Feature[] = [];
    if (path.length >= 2) shapeFeatures.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: path } });
    if (path.length >= 3) shapeFeatures.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...path, path[0]]] } });
    const pointFeatures = vertices.map((position, index): Feature => ({
      type: 'Feature',
      properties: { first: index === 0 ? 1 : 0 },
      geometry: { type: 'Point', coordinates: position },
    }));
    return {
      shape: { type: 'FeatureCollection', features: shapeFeatures } satisfies FeatureCollection,
      points: { type: 'FeatureCollection', features: pointFeatures } satisfies FeatureCollection,
    };
  }, [vertices, pointer]);

  return (
    <>
      <Source id={SOURCE_IDS.draftShape} type="geojson" data={shape}>
        <Layer {...draftFillLayer} />
        <Layer {...draftLineLayer} />
      </Source>
      <Source id={SOURCE_IDS.draftPoints} type="geojson" data={points}>
        <Layer {...draftPointLayer} />
      </Source>
    </>
  );
}
