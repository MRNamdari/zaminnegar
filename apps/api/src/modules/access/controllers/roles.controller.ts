import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedOnly, RequirePermission } from '../decorators/access.decorators';
import { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from '../dto/role.dto';
import { Action, Resource } from '../permissions';
import { AccessAdminService } from '../services/access-admin.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly admin: AccessAdminService) {}

  /** Any signed-in user may read the catalogue: project managers need it to pick a role for a member. */
  @Get()
  @AuthenticatedOnly()
  @ApiOperation({ summary: 'List roles with their permissions' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  async list(): Promise<RoleResponseDto[]> {
    return (await this.admin.listRoles()).map(RoleResponseDto.from);
  }

  @Get(':id')
  @AuthenticatedOnly()
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiOkResponse({ type: RoleResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponseDto> {
    return RoleResponseDto.from(await this.admin.getRole(id));
  }

  @Post()
  @RequirePermission(Resource.role, Action.create, { scope: 'global' })
  @ApiOperation({ summary: 'Create a role' })
  @ApiCreatedResponse({ type: RoleResponseDto })
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    return RoleResponseDto.from(await this.admin.createRole(dto));
  }

  @Patch(':id')
  @RequirePermission(Resource.role, Action.update, { scope: 'global' })
  @ApiOperation({ summary: 'Update a role (name, description, permissions)', description: 'System roles cannot be changed' })
  @ApiOkResponse({ type: RoleResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto): Promise<RoleResponseDto> {
    return RoleResponseDto.from(await this.admin.updateRole(id, dto));
  }

  @Delete(':id')
  @RequirePermission(Resource.role, Action.delete, { scope: 'global' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role', description: 'System roles and roles still assigned to someone cannot be deleted' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.admin.deleteRole(id);
  }
}
