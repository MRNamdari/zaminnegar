import { Query } from '@nestjs/cqrs';
import type { IParcel } from '../../interfaces/parcel.interface';

/** Lists every parcel of a project, oldest first. Rejects with `ProjectNotFoundError` for unknown projects. */
export class ListParcelsQuery extends Query<IParcel[]> {
  constructor(public readonly projectId: string) {
    super();
  }
}
