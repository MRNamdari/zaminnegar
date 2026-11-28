import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccessPolicyService } from '@/modules/auth/abilities/access-policy.service';
import { Action } from '@/modules/auth/permissions';
import { DeleteBlockCommand } from '@/modules/block/commands/delete-block.command';
import { DeleteParcelCommand } from '@/modules/parcel/commands/delete-parcel.command';
import { DeleteRegionCommand } from '@/modules/region/commands/delete-region.command';
import { MapRepository } from '../repositories/map.repository';
import { locateAuthorized } from './map-feature-access';
import { DeleteMapFeatureCommand } from './delete-map-feature.command';

/** Refusals ("region not empty", "block not empty") come from the per-level handlers unchanged. */
@CommandHandler(DeleteMapFeatureCommand)
export class DeleteMapFeatureHandler implements ICommandHandler<
  DeleteMapFeatureCommand,
  void
> {
  constructor(
    private readonly commands: CommandBus,
    private readonly map: MapRepository,
    private readonly auth: AccessPolicyService,
  ) {}

  async execute({ id, principal }: DeleteMapFeatureCommand): Promise<void> {
    const { level } = await locateAuthorized(
      this.map,
      this.auth,
      principal,
      id,
      Action.delete,
    );
    switch (level) {
      case 'region':
        await this.commands.execute<DeleteRegionCommand, void>(
          new DeleteRegionCommand(id),
        );
        return;
      case 'block':
        await this.commands.execute<DeleteBlockCommand, void>(
          new DeleteBlockCommand(id),
        );
        return;
      case 'parcel':
        await this.commands.execute<DeleteParcelCommand, void>(
          new DeleteParcelCommand(id),
        );
        return;
    }
  }
}
