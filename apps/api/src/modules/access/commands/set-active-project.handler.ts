import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AccessPolicyService } from '../abilities/access-policy.service';
import { ActiveProjectResponseDto } from '../dto/active-project-response.dto';
import { NotAuthenticatedError } from '../errors/not-authenticated.error';
import { Action, Resource } from '../permissions';
import { ProjectMemberRepository } from '../repositories/project-member.repository';
import { SessionService } from '../services/session.service';
import { ProjectNotFoundError } from '../../project/errors/project-not-found.error';
import { SetActiveProjectCommand } from './set-active-project.command';

/** Stores the chosen project on the caller's own session. Only a project the caller may read can be chosen. */
@CommandHandler(SetActiveProjectCommand)
export class SetActiveProjectHandler implements ICommandHandler<SetActiveProjectCommand, ActiveProjectResponseDto> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly policy: AccessPolicyService,
    private readonly members: ProjectMemberRepository,
    private readonly sessions: SessionService,
  ) {}

  async execute({ principal, projectId }: SetActiveProjectCommand): Promise<ActiveProjectResponseDto> {
    // A project the caller has nothing to do with answers "not found", exactly like one that does not exist.
    this.policy.assertCan(principal, Action.read, Resource.project, { id: projectId });

    await this.dataSource.transaction(async (manager) => {
      if (!(await this.members.lockProject(projectId, manager))) throw new ProjectNotFoundError(projectId);
      if (!(await this.sessions.setActiveProject(manager, principal.sessionId, projectId))) throw new NotAuthenticatedError();
    });
    return ActiveProjectResponseDto.of(projectId);
  }
}
