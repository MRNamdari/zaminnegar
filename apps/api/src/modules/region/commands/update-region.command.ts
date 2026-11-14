import { UpdateRegionDto } from '../dto/update-region.dto';

export class UpdateRegionCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateRegionDto,
  ) {}
}
