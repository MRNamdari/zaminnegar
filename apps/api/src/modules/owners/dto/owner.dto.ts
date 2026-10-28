import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { IOwner } from '../interfaces/owner.interface';

/** An owner as returned by the API. */
export class OwnerDto {
  @ApiProperty({ format: 'uuid', example: 'b6f0f4b9-b615-4d33-a4d2-70fb4f37af2a' })
  id!: string;

  @ApiProperty({ example: 'Ali Rezaei' })
  name!: string;

  @ApiPropertyOptional({ example: '+989121234567' })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'owner@example.com' })
  email!: string | null;

  @ApiPropertyOptional({ example: 'Primary owner of the west parcel.' })
  notes!: string | null;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-27T10:05:00.000Z' })
  updatedAt!: string;

  static fromOwner(owner: IOwner): OwnerDto {
    return {
      id: owner.id,
      name: owner.name,
      phone: owner.phone ?? null,
      email: owner.email ?? null,
      notes: owner.notes ?? null,
      createdAt: owner.createdAt.toISOString(),
      updatedAt: owner.updatedAt.toISOString(),
    };
  }
}
