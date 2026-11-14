import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleSummaryDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'manager' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'Predefined (seeded) role' })
  @Expose()
  isSystem!: boolean;
}
