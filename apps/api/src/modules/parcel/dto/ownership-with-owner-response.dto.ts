import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IParcelOwnership } from '../../../common/interfaces/parcel-ownership.interface';
import { OwnerResponseDto } from '../../owner/dto/owner-response.dto';
import { OwnershipResponseDto } from './ownership-response.dto';

/** An ownership with the owner's profile (shown when a parcel is selected). */
export class OwnershipWithOwnerResponseDto extends OwnershipResponseDto {
  @ApiProperty({ type: () => OwnerResponseDto })
  @Expose()
  @Type(() => OwnerResponseDto)
  owner!: OwnerResponseDto;

  static from(ownership: IParcelOwnership): OwnershipWithOwnerResponseDto {
    return plainToInstance(OwnershipWithOwnerResponseDto, ownership, { excludeExtraneousValues: true });
  }
}
