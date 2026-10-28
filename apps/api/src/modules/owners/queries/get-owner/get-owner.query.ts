import { Query } from '@nestjs/cqrs';
import type { IOwner } from '../../interfaces/owner.interface';

/** Fetches an owner by id. */
export class GetOwnerQuery extends Query<IOwner> {
  constructor(public readonly ownerId: string) {
    super();
  }
}
