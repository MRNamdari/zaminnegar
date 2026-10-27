import { Command } from '@nestjs/cqrs';
import type { IProjectWithStats } from '../../interfaces/project-with-stats.interface';

/** Creates a project. Resolves with the new project. */
export class CreateProjectCommand extends Command<IProjectWithStats> {
  constructor(
    public readonly name: string,
    public readonly description: string,
  ) {
    super();
  }
}
