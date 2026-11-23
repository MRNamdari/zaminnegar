import { CreateMapFeatureHandler } from './create-map-feature.handler';
import { DeleteMapFeatureHandler } from './delete-map-feature.handler';
import { UpdateMapFeatureHandler } from './update-map-feature.handler';

export const MapCommandHandlers = [CreateMapFeatureHandler, UpdateMapFeatureHandler, DeleteMapFeatureHandler];
