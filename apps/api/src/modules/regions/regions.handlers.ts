import { CreateRegionHandler } from './commands/create-region/create-region.handler';
import { GetRegionHandler } from './queries/get-region/get-region.handler';
import { ListRegionsHandler } from './queries/list-regions/list-regions.handler';

/** Every CQRS handler of the region module, registered in one place. */
export const REGION_HANDLERS = [
  CreateRegionHandler,
  GetRegionHandler,
  ListRegionsHandler,
];
