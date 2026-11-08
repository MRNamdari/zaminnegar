import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedResult } from '../../../common/utils/paginate';
import { Owner } from '../entities/owner.entity';
import { OwnerRepository } from '../repositories/owner.repository';
import { ListOwnersQuery } from './list-owners.query';

@QueryHandler(ListOwnersQuery)
export class ListOwnersHandler implements IQueryHandler<ListOwnersQuery, PaginatedResult<Owner>> {
  constructor(private readonly owners: OwnerRepository) {}

  execute({ dto }: ListOwnersQuery): Promise<PaginatedResult<Owner>> {
    return this.owners.findPage(dto);
  }
}
