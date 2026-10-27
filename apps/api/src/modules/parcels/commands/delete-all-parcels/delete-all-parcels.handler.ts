import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetProjectQuery } from '../../../projects/queries/get-project/get-project.query';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { DeleteAllParcelsCommand } from './delete-all-parcels.command';

@CommandHandler(DeleteAllParcelsCommand)
export class DeleteAllParcelsHandler implements ICommandHandler<DeleteAllParcelsCommand> {
  constructor(
    private readonly parcels: ParcelsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ projectId }: DeleteAllParcelsCommand): Promise<number> {
    await this.queryBus.execute(new GetProjectQuery(projectId));
    return this.parcels.deleteAllByProject(projectId);
  }
}
