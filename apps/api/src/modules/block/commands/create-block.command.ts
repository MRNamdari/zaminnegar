import { BoundarySource } from '../../../common/interfaces/boundary-source.interface';
import { CreateBlockDto } from '../dto/create-block.dto';

/** The boundary comes from `geometry` or from the `boundaryId` of a finished draft. */
export type CreateBlockInput = Omit<CreateBlockDto, 'geometry' | 'boundaryId'> & BoundarySource;

export class CreateBlockCommand {
  constructor(public readonly input: CreateBlockInput) {}
}
