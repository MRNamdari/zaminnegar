import { AssignOwnerHandler } from './assign-owner.handler';
import { CreateParcelHandler } from './create-parcel.handler';
import { DeleteParcelHandler } from './delete-parcel.handler';
import { RemoveOwnerHandler } from './remove-owner.handler';
import { UpdateOwnershipHandler } from './update-ownership.handler';
import { UpdateParcelHandler } from './update-parcel.handler';

export const ParcelCommandHandlers = [
  CreateParcelHandler,
  UpdateParcelHandler,
  DeleteParcelHandler,
  AssignOwnerHandler,
  UpdateOwnershipHandler,
  RemoveOwnerHandler,
];
