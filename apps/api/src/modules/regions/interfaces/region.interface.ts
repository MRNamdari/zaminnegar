import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import type { IBlock } from '../../blocks/interfaces/block.interface';

/** A region defines a geographic territory and the blocks within it. */
export interface IRegion {
  id: string;
  name: string;
  description: string;
  territory: IMultiPolygon;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  blocks?: IBlock[];
}

/** Fields a caller may provide when creating a region. */
export type ICreateRegion = Pick<IRegion, 'name' | 'description' | 'territory'>;
