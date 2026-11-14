import { UpdateParcelDto } from '../dto/update-parcel.dto';

export class UpdateParcelCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateParcelDto,
  ) {}
}
