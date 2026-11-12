import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOptionsExample } from './database/typeorm-options.example';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { AccessModule } from './modules/access/access.module';
import { BlockModule } from './modules/block/block.module';
import { BoundaryModule } from './modules/boundary/boundary.module';
import { GeometryModule } from './modules/geometry/geometry.module';
import { OwnerModule } from './modules/owner/owner.module';
import { ParcelModule } from './modules/parcel/parcel.module';
import { ProjectModule } from './modules/project/project.module';
import { RegionModule } from './modules/region/region.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    AccessModule,
    GeometryModule,
    ProjectModule,
    BoundaryModule,
    RegionModule,
    BlockModule,
    ParcelModule,
    OwnerModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DatabaseExceptionFilter }],
})
export class AppModule {}