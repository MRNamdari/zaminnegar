import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { validateEnvironment } from './config/validate-environment';
import { DatabaseModule } from './database/database.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { OwnersModule } from './modules/owners/owners.module';
import { ParcelsModule } from './modules/parcels/parcels.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RegionsModule } from './modules/regions/regions.module';

/** Root module: configuration, CQRS buses, database and the feature modules. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnvironment }),
    CqrsModule.forRoot(),
    DatabaseModule,
    RegionsModule,
    BlocksModule,
    OwnersModule,
    ProjectsModule,
    ParcelsModule,
  ],
})
export class AppModule {}
