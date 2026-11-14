import { CreateRegionHandler } from './create-region.handler';
import { DeleteRegionHandler } from './delete-region.handler';
import { UpdateRegionHandler } from './update-region.handler';

export const RegionCommandHandlers = [CreateRegionHandler, UpdateRegionHandler, DeleteRegionHandler];
