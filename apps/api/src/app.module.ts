import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { validateEnvironment } from './config/validate-environment';
import { DatabaseModule } from './database/database.module';
import { ParcelsModule } from './modules/parcels/parcels.module';
import { ProjectsModule } from './modules/projects/projects.module';

/** Root module: configuration, CQRS buses, database and the feature modules. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnvironment }),
    CqrsModule.forRoot(),
    DatabaseModule,
    ProjectsModule,
    ParcelsModule,
  ],
})
export class AppModule {}
