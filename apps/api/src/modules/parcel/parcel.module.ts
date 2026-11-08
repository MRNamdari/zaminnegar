import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from '../block/entities/block.entity';
import { BlockRepository } from '../block/repositories/block.repository';
import { GeometryModule } from '../geometry/geometry.module';
import { Owner } from '../owner/entities/owner.entity';
import { OwnerRepository } from '../owner/repositories/owner.repository';
import { Project } from '../project/entities/project.entity';
import { ProjectRepository } from '../project/repositories/project.repository';
import { Region } from '../region/entities/region.entity';
import { RegionRepository } from '../region/repositories/region.repository';
import { ParcelCommandHandlers } from './commands';
import { ParcelOwnership } from './entities/parcel-ownership.entity';
import { Parcel } from './entities/parcel.entity';
import { ParcelQueryHandlers } from './queries';
import { ParcelOwnershipRepository } from './repositories/parcel-ownership.repository';
import { ParcelRepository } from './repositories/parcel.repository';
import { ParcelController } from './parcel.controller';

@Module({
  controllers: [ParcelController],
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Parcel, ParcelOwnership, Owner, Block, Region, Project]),
    GeometryModule,
  ],
  providers: [
    ParcelRepository,
    ParcelOwnershipRepository,
    OwnerRepository,
    BlockRepository,
    RegionRepository,
    ProjectRepository,
    ...ParcelCommandHandlers,
    ...ParcelQueryHandlers,
  ],
  exports: [ParcelRepository, ParcelOwnershipRepository],
})
export class ParcelModule {}
