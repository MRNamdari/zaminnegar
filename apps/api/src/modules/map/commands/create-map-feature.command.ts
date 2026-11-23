import type { Principal } from '../../access/access.types';
import { CreateMapFeatureDto } from '../dto/create-map-feature.dto';

export class CreateMapFeatureCommand {
  constructor(
    public readonly dto: CreateMapFeatureDto,
    public readonly principal: Principal,
  ) {}
}
