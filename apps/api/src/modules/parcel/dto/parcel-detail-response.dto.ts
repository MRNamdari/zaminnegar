import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IParcel } from '../../../common/interfaces/parcel.interface';
import { BlockResponseDto } from '../../block/dto/block-response.dto';
import { BoundaryResponseDto } from '../../boundary/dto/boundary-response.dto';
import { ProjectResponseDto } from '../../project/dto/project-response.dto';
import { RegionResponseDto } from '../../region/dto/region-response.dto';
import { OwnershipWithOwnerResponseDto } from './ownership-with-owner-response.dto';
import { ParcelResponseDto } from './parcel-response.dto';

/** A parcel with every relation loaded: project, region, block, boundary and ownerships (each with its owner). */
export class ParcelDetailResponseDto extends OmitType(ParcelResponseDto, ['region', 'block'] as const) {
  @ApiProperty({ type: () => ProjectResponseDto })
  @Expose()
  @Type(() => ProjectResponseDto)
  project!: ProjectResponseDto;

  @ApiProperty({ type: () => RegionResponseDto })
  @Expose()
  @Type(() => RegionResponseDto)
  region!: RegionResponseDto;

  @ApiProperty({ type: () => BlockResponseDto, nullable: true })
  @Expose()
  @Type(() => BlockResponseDto)
  block!: BlockResponseDto | null;

  @ApiProperty({ type: () => BoundaryResponseDto })
  @Expose()
  @Type(() => BoundaryResponseDto)
  boundary!: BoundaryResponseDto;

  @ApiProperty({ type: () => OwnershipWithOwnerResponseDto, isArray: true })
  @Expose()
  @Type(() => OwnershipWithOwnerResponseDto)
  ownerships!: OwnershipWithOwnerResponseDto[];

  static from(parcel: IParcel): ParcelDetailResponseDto {
    return plainToInstance(ParcelDetailResponseDto, parcel, { excludeExtraneousValues: true });
  }
}
