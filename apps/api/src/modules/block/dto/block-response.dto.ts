import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { IBlock } from '../../../common/interfaces/block.interface';
import { RegionResponseDto } from '../../region/dto/region-response.dto';

export class BlockResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid', description: 'Derived from the block outline by the database' })
  @Expose()
  regionId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: BlockStatus, enumName: 'BlockStatus' })
  @Expose()
  status!: BlockStatus;
  @ApiProperty({ type: 'number', description: 'Geodesic area in square meters' })
  @Expose()
  areaM2!: number;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  @ApiProperty({ type: 'integer', required: false, description: 'Number of parcels in the block. Only present in list responses' })
  @Expose()
  parcelsCount?: number;

  @ApiProperty({ type: () => RegionResponseDto, required: false, description: 'Only present in list responses' })
  @Expose()
  @Type(() => RegionResponseDto)
  region?: RegionResponseDto;

  static from(block: IBlock): BlockResponseDto {
    return plainToInstance(BlockResponseDto, block, { excludeExtraneousValues: true });
  }
}
