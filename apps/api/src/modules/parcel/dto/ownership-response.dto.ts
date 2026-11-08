import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IParcelOwnership } from '../../../common/interfaces/parcel-ownership.interface';

export class OwnershipResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() parcelId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() ownerId!: string;
  @ApiProperty({ minimum: 0.0001, maximum: 100 }) @Expose() sharePct!: number;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(ownership: IParcelOwnership): OwnershipResponseDto {
    return plainToInstance(OwnershipResponseDto, ownership, { excludeExtraneousValues: true });
  }
}
