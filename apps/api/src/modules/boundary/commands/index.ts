import { CreateBoundaryHandler } from './create-boundary.handler';
import { DeleteBoundaryHandler } from './delete-boundary.handler';
import { UpdateBoundaryHandler } from './update-boundary.handler';

export const BoundaryCommandHandlers = [CreateBoundaryHandler, UpdateBoundaryHandler, DeleteBoundaryHandler];
