import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../decorators/access.decorators';
import { AddMemberDto, MemberResponseDto, UpdateMemberDto } from '../dto/member.dto';
import { Action, Resource } from '../permissions';
import { AccessAdminService } from '../services/access-admin.service';

/** Who may act inside a project, and with which role. Authorized on the project in the route. */
@ApiTags('project-members')
@ApiBearerAuth()
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly admin: AccessAdminService) {}

  @Get()
  @RequirePermission(Resource.member, Action.read, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'List the members of a project' })
  @ApiOkResponse({ type: MemberResponseDto, isArray: true })
  list(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<MemberResponseDto[]> {
    return this.admin.listMembers(projectId);
  }

  @Post()
  @RequirePermission(Resource.member, Action.create, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: 'Give a user a role in the project' })
  @ApiCreatedResponse({ type: MemberResponseDto })
  add(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: AddMemberDto): Promise<MemberResponseDto> {
    return this.admin.addMember(projectId, dto);
  }

  @Patch(':userId')
  @RequirePermission(Resource.member, Action.update, { idOf: Resource.project, param: 'projectId' })
  @ApiOperation({ summary: "Change a member's role in the project" })
  @ApiOkResponse({ type: MemberResponseDto })
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.admin.updateMember(projectId, userId, dto);
  }

  @Delete(':userId')
  @RequirePermission(Resource.member, Action.delete, { idOf: Resource.project, param: 'projectId' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user from the project' })
  @ApiNoContentResponse()
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.admin.removeMember(projectId, userId);
  }
}
