import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionEntity } from './entities/region.entity';
import { REGION_HANDLERS } from './regions.handlers';
import { RegionsController } from './regions.controller';
import { RegionsRepository } from './repositories/regions.repository';

/** Region feature module. Registers its own entity with `TypeOrmModule.forFeature`. */
@Module({
  imports: [TypeOrmModule.forFeature([RegionEntity])],
  controllers: [RegionsController],
  providers: [RegionsRepository, ...REGION_HANDLERS],
  exports: [RegionsRepository],
})
export class RegionsModule {}
