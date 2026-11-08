import { CreateProjectDto } from '../dto/create-project.dto';

export class CreateProjectCommand {
  constructor(public readonly dto: CreateProjectDto) {}
}
