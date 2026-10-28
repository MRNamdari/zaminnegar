import { AssignParcelOwnerHandler } from './commands/assign-parcel-owner/assign-parcel-owner.handler';
import { CreateOwnerHandler } from './commands/create-owner/create-owner.handler';
import { DeleteOwnerHandler } from './commands/delete-owner/delete-owner.handler';
import { RemoveParcelOwnerHandler } from './commands/remove-parcel-owner/remove-parcel-owner.handler';
import { UpdateOwnerHandler } from './commands/update-owner/update-owner.handler';
import { UpdateParcelOwnerHandler } from './commands/update-parcel-owner/update-parcel-owner.handler';
import { GetOwnerHandler } from './queries/get-owner/get-owner.handler';
import { ListOwnerParcelsHandler } from './queries/list-owner-parcels/list-owner-parcels.handler';
import { ListOwnersHandler } from './queries/list-owners/list-owners.handler';
import { ListParcelOwnersHandler } from './queries/list-parcel-owners/list-parcel-owners.handler';

/** Every CQRS handler of the owner module, registered in one place. */
export const OWNER_HANDLERS = [
  CreateOwnerHandler,
  GetOwnerHandler,
  ListOwnersHandler,
  UpdateOwnerHandler,
  DeleteOwnerHandler,
  AssignParcelOwnerHandler,
  UpdateParcelOwnerHandler,
  RemoveParcelOwnerHandler,
  ListParcelOwnersHandler,
  ListOwnerParcelsHandler,
];
