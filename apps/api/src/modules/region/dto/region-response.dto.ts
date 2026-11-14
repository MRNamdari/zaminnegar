import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { IRegion } from '../../../common/interfaces/region.interface';

export class RegionResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: RegionStatus, enumName: 'RegionStatus' }) @Expose() status!: RegionStatus;
  @ApiProperty({ type: 'number', description: 'Geodesic area in square meters' }) @Expose() areaM2!: number;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  @ApiProperty({ type: 'integer', required: false, description: 'Number of blocks in the region. Only present in list responses' })
  @Expose()
  blocksCount?: number;

  @ApiProperty({ type: 'integer', required: false, description: 'Number of parcels in the region. Only present in list responses' })
  @Expose()
  parcelsCount?: number;

  static from(region: IRegion): RegionResponseDto {
    return plainToInstance(RegionResponseDto, region, { excludeExtraneousValues: true });
  }
}
