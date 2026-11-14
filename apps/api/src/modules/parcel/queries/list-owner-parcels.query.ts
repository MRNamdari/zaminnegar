/** The parcels an owner holds shares in (select or search an owner -> highlight their parcels). */
export class ListOwnerParcelsQuery {
  constructor(public readonly ownerId: string) {}
}
