import { ApiProperty } from '@nestjs/swagger';
import type { IBlock } from '../interfaces/block.interface';

/** A block as returned by the API. */
export class BlockDto {
  @ApiProperty({ format: 'uuid', example: '4c6e6459-fda9-4c71-bb9c-8bb66efc0701' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11' })
  regionId!: string;

  @ApiProperty({ example: 'North block' })
  name!: string;

  @ApiProperty({ example: 'Upper orchard subdivision.' })
  description!: string;

  @ApiProperty({ description: 'Number of parcels in this block.', example: 6 })
  parcelCount!: number;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;

  static fromBlock(block: IBlock & { parcelCount?: number }): BlockDto {
    return {
      id: block.id,
      regionId: block.regionId,
      name: block.name,
      description: block.description,
      parcelCount: block.parcelCount ?? 0,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    };
  }
}
