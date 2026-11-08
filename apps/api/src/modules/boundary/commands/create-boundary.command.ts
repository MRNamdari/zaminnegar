import { CreateBoundaryDto } from '../dto/create-boundary.dto';

/** Creates a draft boundary (not owned by any region, block or parcel yet). */
export class CreateBoundaryCommand {
  constructor(public readonly dto: CreateBoundaryDto) {}
}
