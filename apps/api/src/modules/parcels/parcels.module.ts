import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelEntity } from './entities/parcel.entity';
import { ParcelsExportController } from './parcels-export.controller';
import { ParcelsController } from './parcels.controller';
import { PARCEL_HANDLERS } from './parcels.handlers';
import { ParcelsRepository } from './repositories/parcels.repository';
import { ParcelGeometryValidator } from './services/parcel-geometry-validator.service';

/**
 * Parcels feature module. It talks to the projects module only through the
 * `QueryBus` (`GetProjectQuery`), so the two modules stay decoupled.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ParcelEntity])],
  controllers: [ParcelsController, ParcelsExportController],
  providers: [ParcelsRepository, ParcelGeometryValidator, ...PARCEL_HANDLERS],
  exports: [ParcelsRepository],
})
export class ParcelsModule {}
