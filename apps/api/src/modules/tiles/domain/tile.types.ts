import { IncomingHttpHeaders } from "node:http";
import { TileCoordinate } from "./tile-coordinate";
export interface StoredTile {
  readonly buffer: Buffer;
  readonly modifiedAt: Date;
  readonly etag: string;
}
export interface TileStorage {
  get(coordinate: TileCoordinate): Promise<StoredTile | null>;
  put(coordinate: TileCoordinate, buffer: Buffer): Promise<void>;
  isNegative(coordinate: TileCoordinate): Promise<boolean>;
  markNegative(coordinate: TileCoordinate): Promise<void>;
  withLock<T>(coordinate: TileCoordinate, work: () => Promise<T>): Promise<T>;
}
export interface TileProvider {
  fetch(
    coordinate: TileCoordinate,
    requestHeaders?: IncomingHttpHeaders,
  ): Promise<Buffer>;
}
export const TILE_STORAGE = Symbol("TILE_STORAGE");
export const TILE_PROVIDER = Symbol("TILE_PROVIDER");
