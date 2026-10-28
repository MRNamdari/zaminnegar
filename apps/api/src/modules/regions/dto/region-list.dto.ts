import { ApiProperty } from '@nestjs/swagger';
import { RegionDto } from './region.dto';

/** One page of regions. */
export class RegionListDto {
  @ApiProperty({ type: [RegionDto] })
  items!: RegionDto[];

  @ApiProperty({
    description: 'Total number of regions, ignoring pagination.',
    example: 3,
  })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;
}
