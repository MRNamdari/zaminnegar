import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IOwner } from '../../interfaces/owner.interface';

/** Lists owners. */
export class ListOwnersQuery extends Query<IPaginated<IOwner>> {
  constructor(
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
