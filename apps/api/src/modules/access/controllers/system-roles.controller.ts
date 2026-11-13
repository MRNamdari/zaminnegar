import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Principal } from '../access.types';
import { ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, CurrentPrincipal, RequirePermission } from '../decorators/access.decorators';
import { RoleResponseDto } from '../dto/role-response.dto';
import { Role } from '../entities/role.entity';
import { Action, Resource } from '../permissions';
import { ListSystemRolesQuery } from '../queries/list-system-roles.query';

@ApiTags('roles')
@ApiSessionAuth()
@Controller('roles')
export class SystemRolesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('system')
  @RequirePermission(Resource.role, Action.read, { scope: 'system' })
  @ApiOperation({ summary: 'The predefined system roles and their permissions' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  @ApiProtectedErrors()
  async list(@CurrentPrincipal() principal: Principal): Promise<RoleResponseDto[]> {
    const roles = await this.queryBus.execute<ListSystemRolesQuery, Role[]>(new ListSystemRolesQuery(principal));
    return roles.map((role) => RoleResponseDto.from(role));
  }
}
