import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Boundary } from '../entities/boundary.entity';
import { BoundaryRepository } from '../repositories/boundary.repository';
import { ListBoundariesQuery } from './list-boundaries.query';

@QueryHandler(ListBoundariesQuery)
export class ListBoundariesHandler implements IQueryHandler<ListBoundariesQuery, PaginatedResult<Boundary>> {
  constructor(private readonly boundaries: BoundaryRepository) {}

  execute({ dto, projectScope }: ListBoundariesQuery): Promise<PaginatedResult<Boundary>> {
    return this.boundaries.findPage(dto, projectScope);
  }
}
