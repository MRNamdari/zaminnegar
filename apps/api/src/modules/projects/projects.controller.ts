import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiUuidParam } from '../../common/decorators/api-uuid-param.decorator';
import { CreateProjectCommand } from './commands/create-project/create-project.command';
import { CreateProjectDto } from './dto/create-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import { ProjectListDto } from './dto/project-list.dto';
import { ProjectDto } from './dto/project.dto';
import { GetProjectQuery } from './queries/get-project/get-project.query';
import { ListProjectsQuery } from './queries/list-projects/list-projects.query';

/** REST endpoints for projects: `/api/v1/projects`. */
@ApiTags('Projects')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a project', description: 'Project names are unique.' })
  @ApiCreatedResponse({ description: 'The created project.', type: ProjectDto })
  @ApiConflictResponse({ description: 'A project with this name already exists.' })
  @ApiErrorResponses(400, 409)
  async create(@Body() body: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.commandBus.execute(new CreateProjectCommand(body.name, body.description));
    return ProjectDto.fromProject(project);
  }

  @Get()
  @ApiOperation({
    summary: 'List projects',
    description: 'Most recently changed projects first. Each project carries its parcel count and extent.',
  })
  @ApiOkResponse({ description: 'One page of projects.', type: ProjectListDto })
  @ApiErrorResponses(400)
  async list(@Query() query: ListProjectsQueryDto): Promise<ProjectListDto> {
    const { items, total } = await this.queryBus.execute(new ListProjectsQuery(query.limit, query.offset));
    return { items: items.map(ProjectDto.fromProject), total, limit: query.limit, offset: query.offset };
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get a project' })
  @ApiUuidParam('projectId', 'Project id.', '5f0c8f0e-2d41-4b6a-9d4e-8a1f0c2b7e11')
  @ApiOkResponse({ description: 'The project.', type: ProjectDto })
  @ApiErrorResponses(400, 404)
  async get(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<ProjectDto> {
    return ProjectDto.fromProject(await this.queryBus.execute(new GetProjectQuery(projectId)));
  }
}
