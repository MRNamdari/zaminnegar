import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Principal } from '../access.types';
import { AddProjectMemberCommand } from '../commands/add-project-member.command';
import { ChangeMemberRoleCommand } from '../commands/change-member-role.command';
import { RemoveProjectMemberCommand } from '../commands/remove-project-member.command';
import { ApiBadRequestErrors, ApiErrorResponse, ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, AuthenticatedOnly, CurrentPrincipal, RequirePermission } from '../decorators/access.decorators';
import { AddMemberDto } from '../dto/add-member.dto';
import { MemberResponseDto } from '../dto/member-response.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { Action, Resource } from '../permissions';
import { ListProjectMembersQuery } from '../queries/list-project-members.query';

/**
 * Membership is the only way a user gets a project role, and every membership names exactly one role. The same user
 * can hold different roles in different projects.
 */
@ApiTags('project-members')
@ApiSessionAuth()
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermission(Resource.member, Action.read, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'List the members of a project', description: 'Contact details are included only for yourself and for system-level callers.' })
  @ApiOkResponse({ type: MemberResponseDto, isArray: true })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project, or not one of yours (`RESOURCE_NOT_FOUND`)')
  async list(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentPrincipal() principal: Principal): Promise<MemberResponseDto[]> {
    return this.queryBus.execute<ListProjectMembersQuery, MemberResponseDto[]>(new ListProjectMembersQuery(principal, projectId));
  }

  @Post()
  @RequirePermission(Resource.member, Action.invite, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({
    summary: 'Add a user to a project with a role',
    description: 'You can assign only roles whose permissions you hold in this project yourself.',
  })
  @ApiCreatedResponse({ type: MemberResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project, role or user (`RESOURCE_NOT_FOUND`, `PROJECT_NOT_FOUND`, `ROLE_NOT_FOUND`, `USER_NOT_FOUND`)')
  @ApiErrorResponse(409, 'Already a member (`MEMBER_ALREADY_EXISTS`)')
  async add(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: AddMemberDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<MemberResponseDto> {
    return this.commandBus.execute<AddProjectMemberCommand, MemberResponseDto>(new AddProjectMemberCommand(principal, projectId, dto));
  }

  @Patch(':userId')
  @RequirePermission(Resource.member, Action.update, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({
    summary: 'Change the role of a member',
    description: 'You can neither assign a role stronger than your own nor change a member who holds one. The last owner cannot be demoted.',
  })
  @ApiOkResponse({ type: MemberResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project, member or role (`RESOURCE_NOT_FOUND`, `PROJECT_NOT_FOUND`, `MEMBER_NOT_FOUND`, `ROLE_NOT_FOUND`)')
  @ApiErrorResponse(409, 'The project would be left without an owner (`LAST_OWNER`)')
  async changeRole(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<MemberResponseDto> {
    return this.commandBus.execute<ChangeMemberRoleCommand, MemberResponseDto>(new ChangeMemberRoleCommand(principal, projectId, userId, dto));
  }

  /** Authorized in the handler, because leaving a project (your own membership) needs no permission at all. */
  @Delete(':userId')
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member, or leave the project yourself' })
  @ApiNoContentResponse()
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project or member (`PROJECT_NOT_FOUND`, `MEMBER_NOT_FOUND`)')
  @ApiErrorResponse(409, 'The project would be left without an owner (`LAST_OWNER`)')
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    await this.commandBus.execute<RemoveProjectMemberCommand, void>(new RemoveProjectMemberCommand(principal, projectId, userId));
  }
}
