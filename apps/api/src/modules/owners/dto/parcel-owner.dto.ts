import { ApiProperty } from '@nestjs/swagger';
import type { IParcelOwner } from '../interfaces/owner.interface';

/** Ownership share of one owner on a parcel. */
export class ParcelOwnerDto {
  @ApiProperty({ format: 'uuid', example: '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11' })
  parcelId!: string;

  @ApiProperty({ format: 'uuid', example: 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a' })
  ownerId!: string;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.5 })
  share!: number;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;

  static fromParcelOwner(parcelOwner: IParcelOwner): ParcelOwnerDto {
    return {
      parcelId: parcelOwner.parcelId,
      ownerId: parcelOwner.ownerId,
      share: parcelOwner.share,
      createdAt: parcelOwner.createdAt.toISOString(),
      updatedAt: parcelOwner.updatedAt.toISOString(),
    };
  }
}
