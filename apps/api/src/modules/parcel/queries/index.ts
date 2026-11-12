import { GetParcelDetailHandler } from './get-parcel-detail.handler';
import { GetParcelHandler } from './get-parcel.handler';
import { ListBlockParcelsHandler } from './list-block-parcels.handler';
import { ListOwnerParcelsHandler } from './list-owner-parcels.handler';
import { ListParcelOwnershipsHandler } from './list-parcel-ownerships.handler';
import { ListParcelsHandler } from './list-parcels.handler';
import { ListRegionParcelsHandler } from './list-region-parcels.handler';

export const ParcelQueryHandlers = [
  GetParcelHandler,
  GetParcelDetailHandler,
  ListParcelsHandler,
  ListParcelOwnershipsHandler,
  ListOwnerParcelsHandler,
  ListRegionParcelsHandler,
  ListBlockParcelsHandler,
];
