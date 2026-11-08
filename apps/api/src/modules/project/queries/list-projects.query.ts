import { ProjectQueryDto } from '../dto/project-query.dto';

export class ListProjectsQuery {
  constructor(public readonly dto: ProjectQueryDto) {}
}
