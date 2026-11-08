import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeometryModule } from '../geometry/geometry.module';
import { Project } from '../project/entities/project.entity';
import { ProjectRepository } from '../project/repositories/project.repository';
import { Region } from '../region/entities/region.entity';
import { RegionRepository } from '../region/repositories/region.repository';
import { BlockCommandHandlers } from './commands';
import { Block } from './entities/block.entity';
import { BlockQueryHandlers } from './queries';
import { BlockRepository } from './repositories/block.repository';
import { BlockController } from './block.controller';

@Module({
  controllers: [BlockController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Block, Region, Project]), GeometryModule],
  providers: [BlockRepository, RegionRepository, ProjectRepository, ...BlockCommandHandlers, ...BlockQueryHandlers],
  exports: [BlockRepository],
})
export class BlockModule {}
