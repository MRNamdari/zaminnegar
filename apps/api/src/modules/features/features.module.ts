import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureRepository } from './repositories/feature.repository';
import { FEATURE_HANDLERS } from './feature.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureEntity } from './entities/feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity])],
  controllers: [FeatureController],
  providers: [FeatureRepository, ...FEATURE_HANDLERS],
  exports: [FeatureRepository],
})
export class FeatureModule {}
