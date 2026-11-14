/** The owners of a parcel with their shares (click a parcel -> owner profiles). */
export class ListParcelOwnershipsQuery {
  constructor(public readonly parcelId: string) {}
}
