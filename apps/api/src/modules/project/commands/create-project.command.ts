import { CreateProjectDto } from '../dto/create-project.dto';

export class CreateProjectCommand {
  constructor(
    public readonly dto: CreateProjectDto,
    /** The authenticated user who creates the project; becomes its owner. */
    public readonly creatorId: string,
  ) {}
}
