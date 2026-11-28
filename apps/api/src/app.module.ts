import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOptionsExample } from './database/typeorm-options.example';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { BlockModule } from './modules/block/block.module';
import { BoundaryModule } from './modules/boundary/boundary.module';
import { GeometryModule } from './modules/geometry/geometry.module';
import { MapModule } from './modules/map/map.module';
import { OwnerModule } from './modules/owner/owner.module';
import { ParcelModule } from './modules/parcel/parcel.module';
import { ProjectModule } from './modules/project/project.module';
import { RegionModule } from './modules/region/region.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import tilesConfig from './modules/tiles/config';
import { TilesModule } from './modules/tiles/tiles.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [tilesConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow('DATABASE_HOST');
        const port = configService.getOrThrow('DATABASE_PORT');
        const username = configService.getOrThrow('DATABASE_USERNAME');
        const password = configService.getOrThrow('DATABASE_PASSWORD');
        const database = configService.getOrThrow('DATABASE_NAME');

        return typeormOptionsExample(host, port, username, password, database);
      },
    }),
    AuthModule,
    GeometryModule,
    ProjectModule,
    BoundaryModule,
    MapModule,
    RegionModule,
    BlockModule,
    ParcelModule,
    OwnerModule,
    ScheduleModule.forRoot(),
    TilesModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DatabaseExceptionFilter }],
})
export class AppModule {}
