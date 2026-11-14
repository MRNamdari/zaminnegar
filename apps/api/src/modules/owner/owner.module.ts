import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelOwnership } from '../parcel/entities/parcel-ownership.entity';
import { ParcelOwnershipRepository } from '../parcel/repositories/parcel-ownership.repository';
import { Project } from '../project/entities/project.entity';
import { ProjectRepository } from '../project/repositories/project.repository';
import { OwnerCommandHandlers } from './commands';
import { Owner } from './entities/owner.entity';
import { OwnerQueryHandlers } from './queries';
import { OwnerRepository } from './repositories/owner.repository';
import { OwnerController } from './owner.controller';

@Module({
  controllers: [OwnerController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Owner, Project, ParcelOwnership])],
  providers: [
    OwnerRepository,
    ProjectRepository,
    ParcelOwnershipRepository,
    ...OwnerCommandHandlers,
    ...OwnerQueryHandlers,
  ],
  exports: [OwnerRepository],
})
export class OwnerModule {}
