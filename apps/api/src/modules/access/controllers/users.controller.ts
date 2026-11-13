import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import type { PaginatedResult } from '../../../common/utils/paginate';
import type { Principal } from '../access.types';
import { UpdateUserCommand } from '../commands/update-user.command';
import { ApiBadRequestErrors, ApiErrorResponse, ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, AuthenticatedOnly, CurrentPrincipal, RequirePermission } from '../decorators/access.decorators';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';
import { Action, Resource } from '../permissions';
import { GetUserQuery } from '../queries/get-user.query';
import { ListUsersQuery } from '../queries/list-users.query';

@ApiTags('users')
@ApiSessionAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermission(Resource.user, Action.read, { scope: 'system' })
  @ApiOperation({ summary: 'List accounts (system level)' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  async list(@Query() query: UserQueryDto, @CurrentPrincipal() principal: Principal): Promise<PaginatedResponseDto<UserResponseDto>> {
    const result = await this.queryBus.execute<ListUsersQuery, PaginatedResult<User>>(new ListUsersQuery(principal, query));
    return PaginatedResponseDto.of(result, UserResponseDto.from);
  }

  @Get(':id')
  @AuthenticatedOnly()
  @ApiOperation({ summary: 'Get an account', description: 'Your own account, or any account with the system-level `user:read` permission.' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such account (`USER_NOT_FOUND`)')
  async get(@Param('id', ParseUUIDPipe) id: string, @CurrentPrincipal() principal: Principal): Promise<UserResponseDto> {
    const user = await this.queryBus.execute<GetUserQuery, User>(new GetUserQuery(principal, id));
    return UserResponseDto.from(user);
  }

  @Patch(':id')
  @RequirePermission(Resource.user, Action.update, { scope: 'system' })
  @ApiOperation({
    summary: 'Activate or deactivate an account, or set its system role',
    description: 'Deactivating an account ends its session. You cannot grant a system role stronger than your own.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestErrors()
  @ApiProtectedErrors()
  @ApiErrorResponse(404, 'No such account or role (`USER_NOT_FOUND`, `ROLE_NOT_FOUND`)')
  @ApiErrorResponse(409, 'The last active superadmin cannot be removed (`LAST_SUPERADMIN`)')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<UserResponseDto> {
    const user = await this.commandBus.execute<UpdateUserCommand, User>(new UpdateUserCommand(principal, id, dto));
    return UserResponseDto.from(user);
  }
}
