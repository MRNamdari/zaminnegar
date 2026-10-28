import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OwnerNotFoundError } from '../../errors/owner-not-found.error';
import type { IOwner } from '../../interfaces/owner.interface';
import { OwnersRepository } from '../../repositories/owners.repository';
import { GetOwnerQuery } from './get-owner.query';

@QueryHandler(GetOwnerQuery)
export class GetOwnerHandler implements IQueryHandler<GetOwnerQuery> {
  constructor(private readonly owners: OwnersRepository) {}

  async execute({ ownerId }: GetOwnerQuery): Promise<IOwner> {
    const owner = await this.owners.findById(ownerId);
    if (!owner) throw new OwnerNotFoundError(ownerId);
    return owner;
  }
}
