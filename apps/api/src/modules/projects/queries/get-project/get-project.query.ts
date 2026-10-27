import { Query } from '@nestjs/cqrs';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';

/** Fetches one project. Rejects with `ProjectNotFoundError` when it does not exist. */
export class GetProjectQuery extends Query<IProjectWithStats> {
  constructor(public readonly projectId: string) {
    super();
  }
}
