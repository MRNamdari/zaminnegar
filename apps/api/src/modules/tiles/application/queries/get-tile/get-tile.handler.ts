import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { createHash } from 'node:crypto';
import tilesConfig from '../../../config';
import { TileCoordinate } from '../../../domain/tile-coordinate';
import {
  TileNotFoundError,
  TileProviderError,
} from '../../../domain/tile.errors';
import {
  TILE_PROVIDER,
  TILE_STORAGE,
  TileProvider,
  TileStorage,
  StoredTile,
} from '../../../domain/tile.types';
import { GetTileQuery } from './get-tile.query';
export interface TileResult extends StoredTile {
  readonly cache: 'HIT' | 'MISS';
}
@QueryHandler(GetTileQuery)
export class GetTileHandler implements IQueryHandler<GetTileQuery, TileResult> {
  constructor(
    @Inject(TILE_STORAGE) private readonly storage: TileStorage,
    @Inject(TILE_PROVIDER) private readonly provider: TileProvider,
    @Inject(tilesConfig.KEY)
    private readonly config: ConfigType<typeof tilesConfig>,
  ) {}
  async execute(query: GetTileQuery): Promise<TileResult> {
    const coordinate = TileCoordinate.create(
      query.z,
      query.x,
      query.y,
      this.config.maxZoom,
    );
    const cached = await this.storage.get(coordinate);
    if (cached) return { ...cached, cache: 'HIT' };
    return this.storage.withLock(coordinate, async () => {
      const secondRead = await this.storage.get(coordinate);
      if (secondRead) return { ...secondRead, cache: 'HIT' };
      if (await this.storage.isNegative(coordinate))
        throw new TileNotFoundError();
      try {
        const buffer = await this.provider.fetch(
          coordinate,
          query.requestHeaders,
        );
        await this.storage.put(coordinate, buffer);
        const saved = await this.storage.get(coordinate);
        if (!saved) throw new Error('Tile missing after cache write');
        return { ...saved, cache: 'MISS' };
      } catch (error) {
        if (
          error instanceof TileProviderError &&
          error.failure === 'NOT_FOUND'
        ) {
          await this.storage.markNegative(coordinate);
          throw new TileNotFoundError();
        }
        throw error;
      }
    });
  }
}
export const tileEtag = (buffer: Buffer): string =>
  `"${createHash('sha256').update(buffer).digest('hex')}"`;
