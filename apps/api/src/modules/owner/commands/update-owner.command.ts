import { UpdateOwnerDto } from '../dto/update-owner.dto';

export class UpdateOwnerCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateOwnerDto,
  ) {}
}
