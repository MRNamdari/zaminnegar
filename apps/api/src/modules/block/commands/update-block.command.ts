import { UpdateBlockDto } from '../dto/update-block.dto';

export class UpdateBlockCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlockDto,
  ) {}
}
