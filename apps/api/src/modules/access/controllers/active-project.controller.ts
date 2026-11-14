import { Body, Controller, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Principal } from '../access.types';
import { SetActiveProjectCommand } from '../commands/set-active-project.command';
import { ApiBadRequestErrors, ApiErrorResponse, ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, AuthenticatedOnly, CurrentPrincipal } from '../decorators/access.decorators';
import { ActiveProjectResponseDto } from '../dto/active-project-response.dto';
import { SetActiveProjectDto } from '../dto/set-active-project.dto';

@ApiTags('auth')
@Controller('auth/session')
export class ActiveProjectController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('project')
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.OK)
  @ApiSessionAuth()
  @ApiOperation({
    summary: 'Choose the active project of this session',
    description:
      'Records and parcels are created in the active project. It is empty after every login, and cleared if the project is deleted.',
  })
  @ApiOkResponse({ type: ActiveProjectResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such project, or not one of yours (`PROJECT_NOT_FOUND`)')
  async setActiveProject(@Body() dto: SetActiveProjectDto, @CurrentPrincipal() principal: Principal): Promise<ActiveProjectResponseDto> {
    return this.commandBus.execute<SetActiveProjectCommand, ActiveProjectResponseDto>(
      new SetActiveProjectCommand(principal, dto.projectId),
    );
  }
}
