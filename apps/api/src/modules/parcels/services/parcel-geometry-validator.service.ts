import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import { InvalidGeometryError } from '../errors/invalid-geometry.error';
import { MIN_PARCEL_AREA_M2 } from '../parcels.constants';
import { ParcelsRepository } from '../repositories/parcels.repository';

/** Topological validation shared by the create and update handlers (PostGIS is the authority). */
@Injectable()
export class ParcelGeometryValidator {
  constructor(private readonly parcels: ParcelsRepository) {}

  /**
   * @throws InvalidGeometryError when the polygon is self-intersecting, malformed or smaller than {@link MIN_PARCEL_AREA_M2}.
   */
  async assertValid(geometry: IMultiPolygon, manager?: EntityManager): Promise<void> {
    const check = await this.parcels.checkGeometry(geometry, manager);
    if (!check.isValid) throw new InvalidGeometryError(check.reason);
    if (check.areaM2 < MIN_PARCEL_AREA_M2) throw new InvalidGeometryError(`area is below ${MIN_PARCEL_AREA_M2} m²`);
  }
}
