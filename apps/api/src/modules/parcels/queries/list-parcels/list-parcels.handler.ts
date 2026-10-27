import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetProjectQuery } from '../../../projects/queries/get-project/get-project.query';
import type { IParcel } from '../../interfaces/parcel.interface';
import { ParcelsRepository } from '../../repositories/parcels.repository';
import { ListParcelsQuery } from './list-parcels.query';

@QueryHandler(ListParcelsQuery)
export class ListParcelsHandler implements IQueryHandler<ListParcelsQuery> {
  constructor(
    private readonly parcels: ParcelsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ projectId }: ListParcelsQuery): Promise<IParcel[]> {
    await this.queryBus.execute(new GetProjectQuery(projectId));
    return this.parcels.findAllByProject(projectId);
  }
}
