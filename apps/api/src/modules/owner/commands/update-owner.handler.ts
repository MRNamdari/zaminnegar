import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Owner } from '../entities/owner.entity';
import { OwnerNotFoundError } from '../errors/owner-not-found.error';
import { OwnerRepository } from '../repositories/owner.repository';
import { UpdateOwnerCommand } from './update-owner.command';

@CommandHandler(UpdateOwnerCommand)
export class UpdateOwnerHandler implements ICommandHandler<UpdateOwnerCommand, Owner> {
  constructor(private readonly owners: OwnerRepository) {}

  async execute({ id, dto }: UpdateOwnerCommand): Promise<Owner> {
    const owner = await this.owners.findById(id);
    if (!owner) throw new OwnerNotFoundError(id);

    // `null` clears an optional field, `undefined` leaves it untouched.
    if (dto.name !== undefined) owner.name = dto.name;
    if (dto.phone !== undefined) owner.phone = dto.phone;
    if (dto.email !== undefined) owner.email = dto.email;
    if (dto.notes !== undefined) owner.notes = dto.notes;

    return this.owners.save(owner);
  }
}
