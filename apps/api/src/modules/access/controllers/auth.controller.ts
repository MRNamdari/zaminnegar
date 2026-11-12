import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthContext } from '../access.types';
import {
  Auth,
  AuthenticatedOnly,
  Public,
} from '../decorators/access.decorators';
import {
  CurrentUserResponseDto,
  LoginDto,
  LoginResponseDto,
} from '../dto/user.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in',
    description: 'Returns an opaque session token to send as a Bearer token',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
  ): Promise<LoginResponseDto> {
    return this.auth.login(dto.email, dto.password, userAgent ?? null);
  }

  @Post('logout')
  @ApiBearerAuth()
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'End the current session' })
  @ApiNoContentResponse()
  async logout(@Auth() auth: AuthContext): Promise<void> {
    await this.auth.logout(auth);
  }

  @Get('me')
  @ApiBearerAuth()
  @AuthenticatedOnly()
  @ApiOperation({
    summary: 'The signed-in user with the permissions they hold',
  })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  me(@Auth() auth: AuthContext): CurrentUserResponseDto {
    return this.auth.me(auth);
  }
}
