import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boundary } from '../boundary/entities/boundary.entity';
import { BoundaryRepository } from '../boundary/repositories/boundary.repository';
import { Parcel } from '../parcel/entities/parcel.entity';
import { ParcelRepository } from '../parcel/repositories/parcel.repository';
import { BoundaryGeometryService } from './services/boundary-geometry.service';
import { SpatialRulesService } from './services/spatial-rules.service';

/** Shared PostGIS rules and boundary lifecycle used by the boundary, region, block and parcel modules. */
@Module({
  imports: [TypeOrmModule.forFeature([Boundary, Parcel])],
  providers: [BoundaryRepository, ParcelRepository, SpatialRulesService, BoundaryGeometryService],
  exports: [BoundaryRepository, SpatialRulesService, BoundaryGeometryService],
})
export class GeometryModule {}
