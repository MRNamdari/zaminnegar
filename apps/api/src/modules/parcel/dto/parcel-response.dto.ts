import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { IParcel } from '../../../common/interfaces/parcel.interface';

export class ParcelResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() regionId!: string;
  @ApiProperty({
    format: 'uuid',
    nullable: true,
    required: false,
    type: 'string',
  })
  @Expose()
  blockId?: string | null;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty({ enum: ParcelStatus, enumName: 'ParcelStatus' })
  @Expose()
  status!: ParcelStatus;
  @ApiProperty({ description: 'Geodesic area in square meters' })
  @Expose()
  areaM2!: number;
  @ApiProperty({
    minimum: 0,
    maximum: 100,
    description: '% of the region this parcel occupies',
  })
  @Expose()
  regionOccupancyPct!: number;
  @ApiProperty({
    minimum: 0,
    maximum: 100,
    nullable: true,
    required: false,
    description: '% of the block this parcel occupies',
  })
  @Expose()
  blockOccupancyPct?: number | null;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(parcel: IParcel): ParcelResponseDto {
    return plainToInstance(ParcelResponseDto, parcel, {
      excludeExtraneousValues: true,
    });
  }
}
