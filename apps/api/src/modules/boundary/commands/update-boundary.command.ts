import { UpdateBoundaryDto } from '../dto/update-boundary.dto';

export class UpdateBoundaryCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBoundaryDto,
  ) {}
}
