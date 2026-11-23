import type { Principal } from '../../access/access.types';
import { UpdateMapFeatureDto } from '../dto/update-map-feature.dto';

export class UpdateMapFeatureCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateMapFeatureDto,
    public readonly principal: Principal,
  ) {}
}
