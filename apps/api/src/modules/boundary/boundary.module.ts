import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeometryModule } from '../geometry/geometry.module';
import { Project } from '../project/entities/project.entity';
import { ProjectRepository } from '../project/repositories/project.repository';
import { BoundaryCommandHandlers } from './commands';
import { Boundary } from './entities/boundary.entity';
import { BoundaryQueryHandlers } from './queries';
import { BoundaryRepository } from './repositories/boundary.repository';
import { BoundaryController } from './boundary.controller';

@Module({
  controllers: [BoundaryController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Boundary, Project]), GeometryModule],
  providers: [BoundaryRepository, ProjectRepository, ...BoundaryCommandHandlers, ...BoundaryQueryHandlers],
  exports: [BoundaryRepository],
})
export class BoundaryModule {}
