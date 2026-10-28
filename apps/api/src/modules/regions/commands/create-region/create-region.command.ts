import { Command } from '@nestjs/cqrs';
import type { IMultiPolygon } from '../../../../common/geometry/interfaces/multi-polygon.interface';
import type { IRegionWithStats } from '../../interfaces/region-with-stats.interface';

/** Creates a region. Resolves with the new region. */
export class CreateRegionCommand extends Command<IRegionWithStats> {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly territory: IMultiPolygon,
  ) {
    super();
  }
}
