import { GetParcelHandler } from './get-parcel.handler';
import { ListOwnerParcelsHandler } from './list-owner-parcels.handler';
import { ListParcelOwnershipsHandler } from './list-parcel-ownerships.handler';
import { ListParcelsHandler } from './list-parcels.handler';

export const ParcelQueryHandlers = [
  GetParcelHandler,
  ListParcelsHandler,
  ListParcelOwnershipsHandler,
  ListOwnerParcelsHandler,
];
