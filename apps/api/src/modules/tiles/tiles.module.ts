import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetTileHandler } from './queries/get-tile.handler';
import { TILE_PROVIDER, TILE_STORAGE } from './domain/tile.types';
import { EsriTileProvider } from './infrastructure/provider/esri-tile.provider';
import { FilesystemTileStorage } from './storage/filesystem-tile.storage';
import { TilesController } from './tiles.controller';

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [TilesController],
  providers: [
    GetTileHandler,
    FilesystemTileStorage,
    EsriTileProvider,
    { provide: TILE_STORAGE, useExisting: FilesystemTileStorage },
    { provide: TILE_PROVIDER, useExisting: EsriTileProvider },
  ],
})
export class TilesModule {}
