import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IOwner } from '../../interfaces/owner.interface';
import { OwnersRepository } from '../../repositories/owners.repository';
import { ListOwnersQuery } from './list-owners.query';

@QueryHandler(ListOwnersQuery)
export class ListOwnersHandler implements IQueryHandler<ListOwnersQuery> {
  constructor(private readonly owners: OwnersRepository) {}

  async execute({ limit, offset }: ListOwnersQuery): Promise<IPaginated<IOwner>> {
    const [items, total] = await Promise.all([
      this.owners.findAll(limit, offset),
      this.owners.count(),
    ]);
    return { items, total };
  }
}
