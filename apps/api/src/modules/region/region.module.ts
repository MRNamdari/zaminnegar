import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeometryModule } from '../geometry/geometry.module';
import { Project } from '../project/entities/project.entity';
import { ProjectRepository } from '../project/repositories/project.repository';
import { RegionCommandHandlers } from './commands';
import { Region } from './entities/region.entity';
import { RegionQueryHandlers } from './queries';
import { RegionRepository } from './repositories/region.repository';
import { RegionController } from './region.controller';

@Module({
  controllers: [RegionController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Region, Project]), GeometryModule],
  providers: [RegionRepository, ProjectRepository, ...RegionCommandHandlers, ...RegionQueryHandlers],
  exports: [RegionRepository],
})
export class RegionModule {}
