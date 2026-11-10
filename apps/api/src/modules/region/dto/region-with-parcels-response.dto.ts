import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { RegionResponseDto } from './region-response.dto';
import { ParcelResponseDto } from '../../parcel/dto/parcel-response.dto';
import { IRegion } from '../../../common/interfaces/region.interface';

/** An ownership with the owner's profile (shown when a parcel is selected). */
export class RegionWithParcelsResponse extends RegionResponseDto {
  @ApiProperty({ type: () => ParcelResponseDto })
  @Expose()
  @Type(() => ParcelResponseDto)
  parcels!: ParcelResponseDto;

  static from(region: IRegion): RegionWithParcelsResponse {
    return plainToInstance(RegionWithParcelsResponse, region, {
      excludeExtraneousValues: true,
    });
  }
}