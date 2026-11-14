import { BoundarySource } from '../../../common/interfaces/boundary-source.interface';
import { CreateParcelDto } from '../dto/create-parcel.dto';

/** The boundary comes from `geometry` or from the `boundaryId` of a finished draft. */
export type CreateParcelInput = Omit<CreateParcelDto, 'geometry' | 'boundaryId'> & BoundarySource;

export class CreateParcelCommand {
  constructor(public readonly input: CreateParcelInput) {}
}
