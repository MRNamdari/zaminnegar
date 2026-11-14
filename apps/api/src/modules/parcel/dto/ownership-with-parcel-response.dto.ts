import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IParcelOwnership } from '../../../common/interfaces/parcel-ownership.interface';
import { OwnershipResponseDto } from './ownership-response.dto';
import { ParcelResponseDto } from './parcel-response.dto';

/** An ownership with the parcel it refers to (shown when an owner is selected). */
export class OwnershipWithParcelResponseDto extends OwnershipResponseDto {
  @ApiProperty({ type: () => ParcelResponseDto })
  @Expose()
  @Type(() => ParcelResponseDto)
  parcel!: ParcelResponseDto;

  static from(ownership: IParcelOwnership): OwnershipWithParcelResponseDto {
    return plainToInstance(OwnershipWithParcelResponseDto, ownership, { excludeExtraneousValues: true });
  }
}
