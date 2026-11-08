export class RemoveOwnerCommand {
  constructor(
    public readonly parcelId: string,
    public readonly ownerId: string,
  ) {}
}
