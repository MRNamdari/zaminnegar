import { ProjectQueryDto } from '../dto/project-query.dto';

export class ListProjectsQuery {
  constructor(
    public readonly dto: ProjectQueryDto,
    /** Projects the caller may read; null = all. */
    public readonly projectScope: string[] | null = null,
  ) {}
}
