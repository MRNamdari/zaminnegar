import { ApiProperty } from '@nestjs/swagger';
import { BlockDto } from './block.dto';

/** One page of blocks. */
export class BlockListDto {
  @ApiProperty({ type: [BlockDto] })
  items!: BlockDto[];

  @ApiProperty({ description: 'Total number of blocks, ignoring pagination.', example: 3 })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
