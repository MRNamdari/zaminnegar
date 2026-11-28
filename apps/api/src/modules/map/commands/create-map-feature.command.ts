import { Principal } from '@/modules/auth/auth.types';
import { CreateMapFeatureDto } from '../dto/create-map-feature.dto';

export class CreateMapFeatureCommand {
  constructor(
    public readonly dto: CreateMapFeatureDto,
    public readonly principal: Principal,
  ) {}
}
