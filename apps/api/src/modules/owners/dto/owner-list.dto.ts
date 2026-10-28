import { ApiProperty } from '@nestjs/swagger';
import { OwnerDto } from './owner.dto';

/** One page of owners. */
export class OwnerListDto {
  @ApiProperty({ type: [OwnerDto] })
  items!: OwnerDto[];

  @ApiProperty({ description: 'Total number of owners, ignoring pagination.', example: 3 })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
