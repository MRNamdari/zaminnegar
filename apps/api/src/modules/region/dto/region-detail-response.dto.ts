import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IRegion } from '../../../common/interfaces/region.interface';
import { BlockResponseDto } from '../../block/dto/block-response.dto';
import { BoundaryResponseDto } from '../../boundary/dto/boundary-response.dto';
import { ParcelResponseDto } from '../../parcel/dto/parcel-response.dto';
import { ProjectResponseDto } from '../../project/dto/project-response.dto';
import { RegionResponseDto } from './region-response.dto';

/** A region with every relation loaded. */
export class RegionDetailResponseDto extends RegionResponseDto {
  @ApiProperty({ type: () => ProjectResponseDto })
  @Expose()
  @Type(() => ProjectResponseDto)
  project!: ProjectResponseDto;

  @ApiProperty({ type: () => BoundaryResponseDto })
  @Expose()
  @Type(() => BoundaryResponseDto)
  boundary!: BoundaryResponseDto;

  @ApiProperty({ type: () => BlockResponseDto, isArray: true })
  @Expose()
  @Type(() => BlockResponseDto)
  blocks!: BlockResponseDto[];

  @ApiProperty({ type: () => ParcelResponseDto, isArray: true })
  @Expose()
  @Type(() => ParcelResponseDto)
  parcels!: ParcelResponseDto[];

  static from(region: IRegion): RegionDetailResponseDto {
    return plainToInstance(RegionDetailResponseDto, region, { excludeExtraneousValues: true });
  }
}
