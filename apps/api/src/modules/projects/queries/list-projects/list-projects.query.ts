import { Query } from '@nestjs/cqrs';
import type { IPaginated } from '../../../../common/interfaces/paginated.interface';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';

/** Lists projects, most recently changed first. */
export class ListProjectsQuery extends Query<IPaginated<IProjectWithStats>> {
  constructor(
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}
