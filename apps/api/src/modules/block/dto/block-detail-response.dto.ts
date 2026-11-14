import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IBlock } from '../../../common/interfaces/block.interface';
import { BoundaryResponseDto } from '../../boundary/dto/boundary-response.dto';
import { ParcelResponseDto } from '../../parcel/dto/parcel-response.dto';
import { ProjectResponseDto } from '../../project/dto/project-response.dto';
import { RegionResponseDto } from '../../region/dto/region-response.dto';
import { BlockResponseDto } from './block-response.dto';

/** A block with every relation loaded. */
export class BlockDetailResponseDto extends OmitType(BlockResponseDto, ['region'] as const) {
  @ApiProperty({ type: () => ProjectResponseDto })
  @Expose()
  @Type(() => ProjectResponseDto)
  project!: ProjectResponseDto;

  @ApiProperty({ type: () => RegionResponseDto })
  @Expose()
  @Type(() => RegionResponseDto)
  region!: RegionResponseDto;

  @ApiProperty({ type: () => BoundaryResponseDto })
  @Expose()
  @Type(() => BoundaryResponseDto)
  boundary!: BoundaryResponseDto;

  @ApiProperty({ type: () => ParcelResponseDto, isArray: true })
  @Expose()
  @Type(() => ParcelResponseDto)
  parcels!: ParcelResponseDto[];

  static from(block: IBlock): BlockDetailResponseDto {
    return plainToInstance(BlockDetailResponseDto, block, { excludeExtraneousValues: true });
  }
}
