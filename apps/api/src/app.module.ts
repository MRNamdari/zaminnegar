import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOptionsExample } from './database/typeorm-options.example';
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

        console.log('ConfigService:', configService);
        console.log('DATABASE_HOST:', configService.get('DATABASE_HOST'));
        const host = configService.getOrThrow('DATABASE_HOST');
        const port = configService.getOrThrow('DATABASE_PORT');
        const username = configService.getOrThrow('DATABASE_USERNAME');
        const password = configService.getOrThrow('DATABASE_PASSWORD');
        const database = configService.getOrThrow('DATABASE_NAME');

        return typeormOptionsExample(host, port, username, password, database);
      },
    }),
    GeometryModule,
    ProjectModule,
    BoundaryModule,
    RegionModule,
    BlockModule,
    ParcelModule,
    OwnerModule,
  ],
})
export class AppModule {}