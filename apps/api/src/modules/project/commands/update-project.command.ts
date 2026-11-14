import { UpdateProjectDto } from '../dto/update-project.dto';

export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProjectDto,
  ) {}
}
