import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Owner } from '../entities/owner.entity';
import { OwnerNotFoundError } from '../errors/owner-not-found.error';
import { OwnerRepository } from '../repositories/owner.repository';
import { GetOwnerQuery } from './get-owner.query';

@QueryHandler(GetOwnerQuery)
export class GetOwnerHandler implements IQueryHandler<GetOwnerQuery, Owner> {
  constructor(private readonly owners: OwnerRepository) {}

  async execute({ id }: GetOwnerQuery): Promise<Owner> {
    const owner = await this.owners.findById(id);
    if (!owner) throw new OwnerNotFoundError(id);
    return owner;
  }
}
