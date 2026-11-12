import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { RequirePermission } from '../decorators/access.decorators';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from '../dto/user.dto';
import { Action, Resource } from '../permissions';
import { AccessAdminService } from '../services/access-admin.service';

/** User administration is global: only a global role (admin) holds `user:*`. */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly admin: AccessAdminService) {}

  @Post()
  @RequirePermission(Resource.user, Action.create, { scope: 'global' })
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.admin.createUser(dto));
  }

  @Get()
  @RequirePermission(Resource.user, Action.read, { scope: 'global' })
  @ApiOperation({ summary: 'List users' })
  @ApiPaginatedResponse(UserResponseDto)
  async list(@Query() query: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return PaginatedResponseDto.of(await this.admin.listUsers(query), UserResponseDto.from);
  }

  @Get(':id')
  @RequirePermission(Resource.user, Action.read, { scope: 'global' })
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ type: UserResponseDto })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.admin.getUser(id));
  }

  @Patch(':id')
  @RequirePermission(Resource.user, Action.update, { scope: 'global' })
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ type: UserResponseDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.admin.updateUser(id, dto));
  }

  @Delete(':id')
  @RequirePermission(Resource.user, Action.delete, { scope: 'global' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.admin.deleteUser(id);
  }
}
