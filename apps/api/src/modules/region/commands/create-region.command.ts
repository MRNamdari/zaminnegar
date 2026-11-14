import { BoundarySource } from '../../../common/interfaces/boundary-source.interface';
import { CreateRegionDto } from '../dto/create-region.dto';

/**
 * The boundary comes from `geometry` (a new boundary row is created) or from `boundaryId`
 * (a finished draft from the map editor). A CreateRegionDto satisfies this as is.
 */
export type CreateRegionInput = Omit<CreateRegionDto, 'geometry' | 'boundaryId'> & BoundarySource & { projectId: string };

export class CreateRegionCommand {
  constructor(public readonly input: CreateRegionInput) {}
}
