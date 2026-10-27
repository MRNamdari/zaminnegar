import { ApiProperty } from '@nestjs/swagger';
import type { IParcel } from '../interfaces/parcel.interface';
import { ParcelFeatureDto } from './parcel-feature.dto';

/** All parcels of a project as an RFC 7946 FeatureCollection (WGS 84, `[longitude, latitude]`). */
export class ParcelFeatureCollectionDto {
  @ApiProperty({ enum: ['FeatureCollection'], example: 'FeatureCollection' })
  type!: 'FeatureCollection';

  @ApiProperty({ type: [ParcelFeatureDto] })
  features!: ParcelFeatureDto[];

  /** Builds the collection from domain parcels. */
  static fromParcels(parcels: IParcel[]): ParcelFeatureCollectionDto {
    return {
      type: 'FeatureCollection',
      features: parcels.map((parcel) => ({
        type: 'Feature',
        id: parcel.id,
        geometry: parcel.geometry,
        properties: {
          id: parcel.id,
          name: parcel.name,
          fillColor: parcel.fillColor,
          fillOpacity: parcel.fillOpacity,
          strokeColor: parcel.strokeColor,
          strokeWidth: parcel.strokeWidth,
          notes: parcel.notes,
          areaM2: parcel.areaM2,
          areaHectares: parcel.areaM2 / 10_000,
          createdAt: parcel.createdAt.toISOString(),
          updatedAt: parcel.updatedAt.toISOString(),
        },
      })),
    };
  }
}
