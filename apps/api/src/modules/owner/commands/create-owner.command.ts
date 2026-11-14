import { CreateOwnerDto } from '../dto/create-owner.dto';

export class CreateOwnerCommand {
  constructor(public readonly dto: CreateOwnerDto) {}
}
