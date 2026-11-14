import type { Principal } from '../../access/access.types';
import { MapFeaturesQueryDto } from '../dto/map-features-query.dto';

export class GetMapFeaturesQuery {
  constructor(
    public readonly dto: MapFeaturesQueryDto,
    public readonly projectScope: string[] | null,
    public readonly principal: Principal,
  ) {}
}
