import { parseAsString, parseAsStringLiteral } from 'nuqs';

export const MAP_MODES = ['select', 'draw', 'edit'] as const;
export type MapMode = (typeof MAP_MODES)[number];

export const BASEMAPS = ['satellite', 'streets'] as const;
export type Basemap = (typeof BASEMAPS)[number];

/**
 * UI state that lives in the URL (shareable, survives reloads):
 * `?parcel=<id>&mode=edit&basemap=streets&q=north`. Defaults are omitted from the URL.
 */
export const workspaceSearchParams = {
  parcel: parseAsString,
  mode: parseAsStringLiteral(MAP_MODES).withDefault('select'),
  basemap: parseAsStringLiteral(BASEMAPS).withDefault('satellite'),
  q: parseAsString.withDefault(''),
};
