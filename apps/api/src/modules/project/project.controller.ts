import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSessionAuth, CurrentPrincipal, ProjectScope, RequirePermission } from '../access/decorators/access.decorators';
import type { Principal } from '../access/access.types';
import { Action, Resource } from '../access/permissions';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedResult } from '../../common/utils/paginate';
import { CreateProjectCommand } from './commands/create-project.command';
import { DeleteProjectCommand } from './commands/delete-project.command';
import { UpdateProjectCommand } from './commands/update-project.command';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { GetProjectQuery } from './queries/get-project.query';
import { ListProjectsQuery } from './queries/list-projects.query';

@ApiTags('projects')
@ApiSessionAuth()
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission(Resource.project, Action.create, { scope: 'system' })
  @ApiOperation({ summary: 'Create a project' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  async create(@Body() dto: CreateProjectDto, @CurrentPrincipal() principal: Principal): Promise<ProjectResponseDto> {
    const entity = await this.commandBus.execute<CreateProjectCommand, Project>(new CreateProjectCommand(dto, principal.user.id));
    return ProjectResponseDto.from(entity);
  }

  @Get()
  @RequirePermission(Resource.project, Action.read, { scope: 'query' })
  @RequirePermission(Resource.project, Action.read, { scope: 'query' })
  @ApiOperation({ summary: 'List projects' })
  @ApiPaginatedResponse(ProjectResponseDto)
  async list(@Query() query: ProjectQueryDto, @ProjectScope() projectScope: string[] | null): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const result = await this.queryBus.execute<ListProjectsQuery, PaginatedResult<Project>>(new ListProjectsQuery(query, projectScope));
  async list(@Query() query: ProjectQueryDto, @ProjectScope() projectScope: string[] | null): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    const result = await this.queryBus.execute<ListProjectsQuery, PaginatedResult<Project>>(new ListProjectsQuery(query, projectScope));
    return PaginatedResponseDto.of(result, ProjectResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.project, Action.read)
  @RequirePermission(Resource.project, Action.read)
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiOkResponse({ type: ProjectResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<ProjectResponseDto> {
    const entity = await this.queryBus.execute<GetProjectQuery, Project>(new GetProjectQuery(id));
    return ProjectResponseDto.from(entity);
  }

  @Patch(':id')
  @RequirePermission(Resource.project, Action.update)
  @RequirePermission(Resource.project, Action.update)
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ type: ProjectResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const entity = await this.commandBus.execute<UpdateProjectCommand, Project>(new UpdateProjectCommand(id, dto));
    return ProjectResponseDto.from(entity);
  }

  @Delete(':id')
  @RequirePermission(Resource.project, Action.delete)
  @RequirePermission(Resource.project, Action.delete)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute<DeleteProjectCommand, void>(new DeleteProjectCommand(id));
  }
}
