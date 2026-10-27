import { CreateParcelHandler } from './commands/create-parcel/create-parcel.handler';
import { DeleteAllParcelsHandler } from './commands/delete-all-parcels/delete-all-parcels.handler';
import { DeleteParcelHandler } from './commands/delete-parcel/delete-parcel.handler';
import { UpdateParcelHandler } from './commands/update-parcel/update-parcel.handler';
import { GetParcelHandler } from './queries/get-parcel/get-parcel.handler';
import { ListParcelsHandler } from './queries/list-parcels/list-parcels.handler';

/** Every CQRS handler of the parcels module, registered in one place. */
export const PARCEL_HANDLERS = [
  CreateParcelHandler,
  UpdateParcelHandler,
  DeleteParcelHandler,
  DeleteAllParcelsHandler,
  GetParcelHandler,
  ListParcelsHandler,
];
