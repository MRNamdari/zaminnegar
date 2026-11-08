import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectCommandHandlers } from './commands';
import { Project } from './entities/project.entity';
import { ProjectQueryHandlers } from './queries';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectController } from './project.controller';

@Module({
  controllers: [ProjectController],
  imports: [CqrsModule, TypeOrmModule.forFeature([Project])],
  providers: [ProjectRepository, ...ProjectCommandHandlers, ...ProjectQueryHandlers],
  exports: [ProjectRepository],
})
export class ProjectModule {}
