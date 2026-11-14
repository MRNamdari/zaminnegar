import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Principal } from '../access.types';
import { CreateProjectRoleCommand } from '../commands/create-project-role.command';
import { DeleteProjectRoleCommand } from '../commands/delete-project-role.command';
import { UpdateProjectRoleCommand } from '../commands/update-project-role.command';
import { ApiBadRequestErrors, ApiErrorResponse, ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, CurrentPrincipal, RequirePermission } from '../decorators/access.decorators';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleResponseDto } from '../dto/role-response.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { Action, Resource } from '../permissions';
import { GetProjectRoleQuery } from '../queries/get-project-role.query';
import { ListProjectRolesQuery } from '../queries/list-project-roles.query';

/** The roles assignable in one project: the shared predefined project roles plus this project's own custom roles. */
@ApiTags('roles')
@ApiSessionAuth()
@Controller('projects/:projectId/roles')
export class ProjectRolesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermission(Resource.role, Action.read, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'List the roles assignable in a project' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project, or not one of yours (`RESOURCE_NOT_FOUND`)')
  async list(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentPrincipal() principal: Principal): Promise<RoleResponseDto[]> {
    const roles = await this.queryBus.execute<ListProjectRolesQuery, Role[]>(new ListProjectRolesQuery(principal, projectId));
    return roles.map((role) => RoleResponseDto.from(role));
  }

  @Get(':roleId')
  @RequirePermission(Resource.role, Action.read, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'Get a role of a project' })
  @ApiOkResponse({ type: RoleResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project or role (`RESOURCE_NOT_FOUND`, `ROLE_NOT_FOUND`)')
  async get(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<RoleResponseDto> {
    const role = await this.queryBus.execute<GetProjectRoleQuery, Role>(new GetProjectRoleQuery(principal, projectId, roleId));
    return RoleResponseDto.from(role);
  }

  @Post()
  @RequirePermission(Resource.role, Action.create, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({
    summary: 'Create a custom role in a project',
    description: 'The role belongs to this project only. It can hold only permissions that you hold in this project yourself.',
  })
  @ApiCreatedResponse({ type: RoleResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project (`RESOURCE_NOT_FOUND`, `PROJECT_NOT_FOUND`)')
  @ApiErrorResponse(409, 'A role with this name exists in the project (`ROLE_NAME_TAKEN`)')
  @ApiErrorResponse(422, 'A permission does not exist or cannot be held by a project role (`PERMISSION_NOT_GRANTABLE`)')
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateRoleDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<RoleResponseDto> {
    const role = await this.commandBus.execute<CreateProjectRoleCommand, Role>(new CreateProjectRoleCommand(principal, projectId, dto));
    return RoleResponseDto.from(role);
  }

  @Patch(':roleId')
  @RequirePermission(Resource.role, Action.update, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'Update a custom role', description: 'Predefined roles cannot be changed. Changes apply to its members immediately.' })
  @ApiOkResponse({ type: RoleResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project or role (`RESOURCE_NOT_FOUND`, `PROJECT_NOT_FOUND`, `ROLE_NOT_FOUND`)')
  @ApiErrorResponse(409, 'Name taken (`ROLE_NAME_TAKEN`) or predefined role (`SYSTEM_ROLE_IMMUTABLE`)')
  @ApiErrorResponse(422, 'A permission does not exist or cannot be held by a project role (`PERMISSION_NOT_GRANTABLE`)')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() dto: UpdateRoleDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<RoleResponseDto> {
    const role = await this.commandBus.execute<UpdateProjectRoleCommand, Role>(
      new UpdateProjectRoleCommand(principal, projectId, roleId, dto),
    );
    return RoleResponseDto.from(role);
  }

  @Delete(':roleId')
  @RequirePermission(Resource.role, Action.delete, { idOf: Resource.project, param: 'projectId' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom role that no member holds' })
  @ApiNoContentResponse()
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project or role (`RESOURCE_NOT_FOUND`, `PROJECT_NOT_FOUND`, `ROLE_NOT_FOUND`)')
  @ApiErrorResponse(409, 'Predefined role (`SYSTEM_ROLE_IMMUTABLE`) or still assigned (`ROLE_IN_USE`)')
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    await this.commandBus.execute<DeleteProjectRoleCommand, void>(new DeleteProjectRoleCommand(principal, projectId, roleId));
  }
}
