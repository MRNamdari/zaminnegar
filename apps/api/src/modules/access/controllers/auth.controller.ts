import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthContext } from '../access.types';
import { LoginWithPasswordCommand, LogoutCommand, RequestOtpCommand, VerifyOtpCommand } from '../commands/auth.commands';
import { Auth, AuthenticatedOnly, Public } from '../decorators/access.decorators';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../dto/error.dto';
import { RequestOtpDto, RequestOtpResponseDto, VerifyOtpDto, VerifyOtpResponseDto } from '../dto/otp.dto';
import { CurrentUserResponseDto, LoginDto, LoginResponseDto } from '../dto/user.dto';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Post('otp/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a sign-in code by SMS',
    description:
      'Step 1 of sign-up and sign-in (one flow). Sends a 6-digit code to an Iranian mobile number. ' +
      'The response is identical for registered and unknown numbers.',
  })
  @ApiOkResponse({ type: RequestOtpResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto, description: 'OTP_COOLDOWN or OTP_RATE_LIMITED' })
  @ApiBadGatewayResponse({ type: ErrorResponseDto, description: 'SMS_DELIVERY_FAILED: the SMS provider did not accept the message' })
  requestOtp(@Body() dto: RequestOtpDto, @Ip() ip: string | undefined): Promise<RequestOtpResponseDto> {
    return this.commands.execute(new RequestOtpCommand(dto.phone, ip || null));
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign up or sign in with the SMS code',
    description:
      'Step 2. A valid code signs the user in; if the number has no account yet, one is created (`isNewUser: true`). ' +
      'Returns an opaque session token to send as a Bearer token.',
  })
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'INVALID_OTP: wrong, expired or already used code' })
  @ApiForbiddenResponse({ type: ErrorResponseDto, description: 'USER_INACTIVE' })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto, description: 'OTP_ATTEMPTS_EXCEEDED: request a new code' })
  verifyOtp(@Body() dto: VerifyOtpDto, @Headers('user-agent') userAgent?: string): Promise<VerifyOtpResponseDto> {
    return this.commands.execute(new VerifyOtpCommand(dto.phone, dto.code, dto.name ?? null, userAgent ?? null));
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with email and password (optional method)',
    description: 'Only for users that have an email and a password. Returns an opaque session token to send as a Bearer token',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'INVALID_CREDENTIALS' })
  login(@Body() dto: LoginDto, @Headers('user-agent') userAgent?: string): Promise<LoginResponseDto> {
    return this.commands.execute(new LoginWithPasswordCommand(dto.email, dto.password, userAgent ?? null));
  }

  @Post('logout')
  @ApiBearerAuth()
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'End the current session' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ValidationErrorResponseDto })
  async logout(@Auth() auth: AuthContext): Promise<void> {
    await this.commands.execute(new LogoutCommand(auth));
  }

  @Get('me')
  @ApiBearerAuth()
  @AuthenticatedOnly()
  @ApiOperation({ summary: 'The signed-in user with the permissions they hold' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiUnauthorizedResponse({ type: ValidationErrorResponseDto })
  me(@Auth() auth: AuthContext): Promise<CurrentUserResponseDto> {
    return this.queries.execute(new GetCurrentUserQuery(auth));
  }
}
