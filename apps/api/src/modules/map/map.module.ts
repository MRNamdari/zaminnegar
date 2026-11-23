import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from '../block/entities/block.entity';
import { Parcel } from '../parcel/entities/parcel.entity';
import { Region } from '../region/entities/region.entity';
import { MapCommandHandlers } from './commands';
import { MapController } from './map.controller';
import { MapQueryHandlers } from './queries';
import { MapRepository } from './repositories/map.repository';

@Module({
  controllers: [MapController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Region, Block, Parcel])],
  providers: [MapRepository, ...MapQueryHandlers, ...MapCommandHandlers],
})
export class MapModule {}
