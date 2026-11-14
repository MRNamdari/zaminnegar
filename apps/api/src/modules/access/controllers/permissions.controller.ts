import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, AuthenticatedOnly } from '../decorators/access.decorators';
import { PermissionDefinitionResponseDto } from '../dto/permission-definition-response.dto';
import { Permission } from '../entities/permission.entity';
import { ListPermissionsQuery } from '../queries/list-permissions.query';

@ApiTags('roles')
@ApiSessionAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @AuthenticatedOnly()
  @ApiOperation({ summary: 'The permission catalogue: everything a role can be granted' })
  @ApiOkResponse({ type: PermissionDefinitionResponseDto, isArray: true })
  @ApiProtectedErrors()
  async list(): Promise<PermissionDefinitionResponseDto[]> {
    const permissions = await this.queryBus.execute<ListPermissionsQuery, Permission[]>(new ListPermissionsQuery());
    return permissions.map((permission) => PermissionDefinitionResponseDto.from(permission));
  }
}
