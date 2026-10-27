'use client';

import { Layer, Source } from 'react-map-gl/maplibre';
import type { Basemap } from '@/features/workspace/search-params';
import { STREETS_IMAGERY } from '../config/streets-imagery';
import type { ImageryConfig } from '../types';

interface BasemapLayersProps {
  satellite: ImageryConfig;
  basemap: Basemap;
}

/** Satellite and street raster layers; the inactive one is hidden rather than removed. */
export function BasemapLayers({ satellite, basemap }: BasemapLayersProps) {
  const visibility = (name: Basemap) => (basemap === name ? 'visible' : 'none');
  return (
    <>
      <Source id="satellite" type="raster" tiles={satellite.tiles} tileSize={satellite.tileSize} maxzoom={satellite.maxzoom} attribution={satellite.attribution}>
        <Layer id="satellite" type="raster" layout={{ visibility: visibility('satellite') }} />
      </Source>
      <Source id="streets" type="raster" tiles={STREETS_IMAGERY.tiles} tileSize={STREETS_IMAGERY.tileSize} maxzoom={STREETS_IMAGERY.maxzoom} attribution={STREETS_IMAGERY.attribution}>
        <Layer id="streets" type="raster" layout={{ visibility: visibility('streets') }} />
      </Source>
    </>
  );
}
