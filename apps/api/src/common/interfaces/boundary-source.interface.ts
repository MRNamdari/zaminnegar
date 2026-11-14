import type { IMultiPolygon } from './geometry.interface';

/**
 * Where a region/block/parcel gets its boundary from. Exactly one of the two:
 *  - `geometry`:   a boundary row is created from it in the same transaction;
 *  - `boundaryId`: an existing, still unassigned (draft) boundary drawn earlier in the map editor.
 */
export type BoundarySource =
  | { geometry: IMultiPolygon; boundaryId?: undefined }
  | { boundaryId: string; geometry?: undefined };
