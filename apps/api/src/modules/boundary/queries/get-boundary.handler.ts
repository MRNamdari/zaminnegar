import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Boundary } from '../entities/boundary.entity';
import { BoundaryNotFoundError } from '../errors/boundary-not-found.error';
import { BoundaryRepository } from '../repositories/boundary.repository';
import { GetBoundaryQuery } from './get-boundary.query';

@QueryHandler(GetBoundaryQuery)
export class GetBoundaryHandler implements IQueryHandler<GetBoundaryQuery, Boundary> {
  constructor(private readonly boundaries: BoundaryRepository) {}

  async execute({ id }: GetBoundaryQuery): Promise<Boundary> {
    const boundary = await this.boundaries.findById(id);
    if (!boundary) throw new BoundaryNotFoundError(id);
    return boundary;
  }
}
