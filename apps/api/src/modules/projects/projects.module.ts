import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { PROJECT_HANDLERS } from './projects.handlers';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './repositories/projects.repository';

/** Projects feature module. Registers its own entity with `TypeOrmModule.forFeature`. */
@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity])],
  controllers: [ProjectsController],
  providers: [ProjectsRepository, ...PROJECT_HANDLERS],
  exports: [ProjectsRepository],
})
export class ProjectsModule {}
