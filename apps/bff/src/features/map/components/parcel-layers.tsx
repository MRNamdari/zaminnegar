'use client';

import type { ParcelDto } from '@zaminnegar/api-client';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { parcelFillLayer, parcelHaloLayer, parcelLineLayer, SOURCE_IDS } from '../config/map-layers';
import { parcelsToFeatureCollection, type GeometryOverride } from '../lib/parcel-geojson';

interface ParcelLayersProps {
  parcels: readonly ParcelDto[];
  selectedParcelId: string | null;
  /** Geometry to show instead of the stored one while a parcel is being edited. */
  geometryOverride?: GeometryOverride;
}

/** Renders every parcel: fill, selection halo and outline. */
export function ParcelLayers({ parcels, selectedParcelId, geometryOverride }: ParcelLayersProps) {
  const data = useMemo(() => parcelsToFeatureCollection(parcels, selectedParcelId, geometryOverride), [parcels, selectedParcelId, geometryOverride]);
  return (
    <Source id={SOURCE_IDS.parcels} type="geojson" data={data}>
      <Layer {...parcelFillLayer} />
      <Layer {...parcelHaloLayer} />
      <Layer {...parcelLineLayer} />
    </Source>
  );
}
