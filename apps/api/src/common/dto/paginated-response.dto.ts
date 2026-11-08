import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '../utils/paginate';

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items!: T[];

  @ApiProperty({ description: 'Total number of matches across all pages' })
  total!: number;

  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;

  /** Maps every entity of a page with `map` (usually `SomeResponseDto.from`). */
  static of<E, T>(result: PaginatedResult<E>, map: (entity: E) => T): PaginatedResponseDto<T> {
    const dto = new PaginatedResponseDto<T>();
    dto.items = result.items.map(map);
    dto.total = result.total;
    dto.page = result.page;
    dto.limit = result.limit;
    return dto;
  }
}
