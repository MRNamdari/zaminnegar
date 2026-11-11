import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { IBlock } from '../../../common/interfaces/block.interface';
import { Region } from '../../region/entities/region.entity';
import { RegionResponseDto } from '../../region/dto/region-response.dto';

export class BlockResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() regionId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty({ type: 'number' }) @Expose() areaM2!: number;
  @ApiProperty({ type: 'number', nullable: true, required: false })
  @Expose()
  parcelsCount?: number;
  @ApiProperty({
    type: () => PartialType(RegionResponseDto),
    nullable: true,
    required: false,
  })
  @Expose()
  @Type(() => RegionResponseDto)
  region?: Partial<Region>;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: BlockStatus, enumName: 'BlockStatus' })
  @Expose()
  status!: BlockStatus;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(block: IBlock): BlockResponseDto {
    return plainToInstance(BlockResponseDto, block, {
      excludeExtraneousValues: true,
    });
  }
}
