import { CreateOwnerHandler } from './create-owner.handler';
import { DeleteOwnerHandler } from './delete-owner.handler';
import { UpdateOwnerHandler } from './update-owner.handler';

export const OwnerCommandHandlers = [CreateOwnerHandler, UpdateOwnerHandler, DeleteOwnerHandler];
