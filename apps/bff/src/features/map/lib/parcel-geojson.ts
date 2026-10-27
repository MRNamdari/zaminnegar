import type { MultiPolygonDto, ParcelDto } from '@zaminnegar/api-client';
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

/** Replaces the geometry of one parcel while it is being edited (live preview). */
export interface GeometryOverride {
  parcelId: string;
  geometry: MultiPolygonDto;
}

/**
 * Converts parcels into the GeoJSON source data of the map. Style values travel as feature
 * properties so MapLibre can read them with data-driven expressions.
 */
export function parcelsToFeatureCollection(
  parcels: readonly ParcelDto[],
  selectedParcelId: string | null,
  override?: GeometryOverride,
): FeatureCollection<MultiPolygon> {
  return {
    type: 'FeatureCollection',
    features: parcels.map(
      (parcel): Feature<MultiPolygon> => ({
        type: 'Feature',
        geometry: (override && override.parcelId === parcel.id ? override.geometry : parcel.geometry) as MultiPolygon,
        properties: {
          id: parcel.id,
          fillColor: parcel.fillColor,
          fillOpacity: parcel.fillOpacity,
          strokeColor: parcel.strokeColor,
          strokeWidth: parcel.strokeWidth,
          selected: parcel.id === selectedParcelId ? 1 : 0,
        },
      }),
    ),
  };
}
