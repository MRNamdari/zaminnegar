import { AssignOwnerDto } from '../dto/assign-owner.dto';

export class AssignOwnerCommand {
  constructor(
    public readonly parcelId: string,
    public readonly dto: AssignOwnerDto,
  ) {}
}
