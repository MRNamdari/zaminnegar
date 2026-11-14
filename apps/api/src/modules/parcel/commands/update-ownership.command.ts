import { UpdateOwnershipDto } from '../dto/update-ownership.dto';

export class UpdateOwnershipCommand {
  constructor(
    public readonly parcelId: string,
    public readonly ownerId: string,
    public readonly dto: UpdateOwnershipDto,
  ) {}
}
