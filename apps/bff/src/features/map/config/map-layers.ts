import type { LayerProps } from 'react-map-gl/maplibre';

export const SOURCE_IDS = {
  parcels: 'parcels',
  draftShape: 'draft-shape',
  draftPoints: 'draft-points',
} as const;

export const PARCEL_FILL_LAYER_ID = 'parcels-fill';

const isSelected = ['==', ['get', 'selected'], 1] as any;

/** Semi-transparent fill so the imagery stays visible; color and opacity come from each feature. */
export const parcelFillLayer: LayerProps = {
  id: PARCEL_FILL_LAYER_ID,
  type: 'fill',
  paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': ['get', 'fillOpacity'] },
};

/** White halo under the selected parcel's outline. */
export const parcelHaloLayer: LayerProps = {
  id: 'parcels-halo',
  type: 'line',
  filter: isSelected,
  layout: { 'line-join': 'round' },
  paint: { 'line-color': '#ffffff', 'line-opacity': 0.9, 'line-width': ['+', ['get', 'strokeWidth'], 6] },
} as any;

/** Parcel outline; the selected parcel is drawn thicker and in saffron. */
export const parcelLineLayer: LayerProps = {
  id: 'parcels-line',
  type: 'line',
  layout: { 'line-join': 'round' },
  paint: {
    'line-color': ['case', isSelected, '#e0a419', ['get', 'strokeColor']],
    'line-width': ['case', isSelected, ['+', ['get', 'strokeWidth'], 1.5], ['get', 'strokeWidth']],
  },
};

export const draftFillLayer: LayerProps = {
  id: 'draft-fill',
  type: 'fill',
  filter: ['==', ['geometry-type'], 'Polygon'],
  paint: { 'fill-color': '#e0a419', 'fill-opacity': 0.2 },
} as any;

export const draftLineLayer: LayerProps = {
  id: 'draft-line',
  type: 'line',
  filter: ['==', ['geometry-type'], 'LineString'],
  layout: { 'line-join': 'round', 'line-cap': 'round' },
  paint: { 'line-color': '#e0a419', 'line-width': 3, 'line-dasharray': [2, 1.2] },
} as any;

/** Draft vertices; the first one is larger because clicking it closes the polygon. */
export const draftPointLayer: LayerProps = {
  id: 'draft-points',
  type: 'circle',
  paint: {
    'circle-radius': ['case', ['==', ['get', 'first'], 1], 8, 5],
    'circle-color': ['case', ['==', ['get', 'first'], 1], '#e0a419', '#ffffff'],
    'circle-stroke-color': '#1b2a24',
    'circle-stroke-width': 2,
  },
};
