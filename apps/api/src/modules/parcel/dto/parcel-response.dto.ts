import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { ParcelStatus } from '../../../common/enums/parcel-status.enum';
import { IParcel } from '../../../common/interfaces/parcel.interface';
import { BlockResponseDto } from '../../block/dto/block-response.dto';
import { RegionResponseDto } from '../../region/dto/region-response.dto';

export class ParcelResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid', description: 'Derived from the parcel outline by the database' })
  @Expose()
  regionId!: string;
  @ApiProperty({
    format: 'uuid',
    nullable: true,
    required: false,
    type: 'string',
    description: 'Derived from the parcel outline by the database; null when no block contains the parcel',
  })
  @Expose()
  blockId?: string | null;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty({ enum: ParcelStatus, enumName: 'ParcelStatus' })
  @Expose()
  status!: ParcelStatus;
  @ApiProperty({ type: 'number', description: 'Geodesic area in square meters' })
  @Expose()
  areaM2!: number;
  @ApiProperty({
    type: 'number',
    minimum: 0,
    maximum: 100,
    description: '% of the region this parcel occupies',
  })
  @Expose()
  regionOccupancyPct!: number;
  @ApiProperty({
    type: 'number',
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

  @ApiProperty({ type: 'integer', required: false, description: 'Number of owners holding a share. Only present in list responses' })
  @Expose()
  ownershipsCount?: number;

  @ApiProperty({ type: () => RegionResponseDto, required: false, description: 'Only present in list responses' })
  @Expose()
  @Type(() => RegionResponseDto)
  region?: RegionResponseDto;

  @ApiProperty({
    type: () => BlockResponseDto,
    nullable: true,
    required: false,
    description: 'Only present in list responses; null when the parcel is in no block',
  })
  @Expose()
  @Type(() => BlockResponseDto)
  block?: BlockResponseDto | null;

  static from(parcel: IParcel): ParcelResponseDto {
    return plainToInstance(ParcelResponseDto, parcel, { excludeExtraneousValues: true });
  }
}
