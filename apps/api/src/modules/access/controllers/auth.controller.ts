import { Body, Controller, Get, Header, Headers, HttpCode, HttpStatus, Ip, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { Principal } from '../access.types';
import { LoginCommand } from '../commands/login.command';
import { LogoutCommand } from '../commands/logout.command';
import { RegisterUserCommand } from '../commands/register-user.command';
import { RenewSessionCommand } from '../commands/renew-session.command';
import { RequestPasswordResetCommand } from '../commands/request-password-reset.command';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import type { SessionResult } from '../commands/session-result';
import { VerifyRegistrationCommand } from '../commands/verify-registration.command';
import { ApiBadRequestErrors, ApiErrorResponse, ApiProtectedErrors } from '../decorators/api-error-responses.decorator';
import { ApiSessionAuth, AuthenticatedOnly, CurrentPrincipal, Public } from '../decorators/access.decorators';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { OtpDispatchResponseDto } from '../dto/otp-dispatch-response.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { VerifyRegistrationDto } from '../dto/verify-registration.dto';
import { SessionCookieService } from '../services/session-cookie.service';

const SET_COOKIE_HEADER = {
  'Set-Cookie': { description: 'The HTTP-only session cookie', schema: { type: 'string' } },
} as const;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cookies: SessionCookieService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Start a registration',
    description:
      'Sends a verification code to the phone number. The answer is the same whether or not the username or phone is already registered.',
  })
  @ApiAcceptedResponse({ type: OtpDispatchResponseDto })
  @ApiBadRequestErrors()
  @ApiErrorResponse(429, 'Code requested too often for this phone or from this address (`OTP_COOLDOWN`, `OTP_RATE_LIMITED`)')
  async register(@Body() dto: RegisterUserDto, @Ip() ip: string): Promise<OtpDispatchResponseDto> {
    return this.commandBus.execute<RegisterUserCommand, OtpDispatchResponseDto>(new RegisterUserCommand(dto, ip || null));
  }

  @Post('register/verify')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Finish a registration with the code sent by SMS', description: 'Activates the account; sign in afterwards.' })
  @ApiNoContentResponse({ description: 'Phone verified, account active' })
  @ApiBadRequestErrors('Invalid request, or the code is wrong, expired or used (`INVALID_OTP`)')
  @ApiErrorResponse(429, 'Too many wrong codes (`OTP_ATTEMPTS_EXCEEDED`)')
  async verifyRegistration(@Body() dto: VerifyRegistrationDto): Promise<void> {
    await this.commandBus.execute<VerifyRegistrationCommand, void>(new VerifyRegistrationCommand(dto));
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Sign in with username and password',
    description: 'Sets the session cookie and ends any previous session of this account.',
  })
  @ApiOkResponse({ type: SessionResponseDto, headers: SET_COOKIE_HEADER })
  @ApiBadRequestErrors()
  @ApiErrorResponse(401, 'Wrong username or password, or the account is temporarily locked (`INVALID_CREDENTIALS`)')
  @ApiErrorResponse(403, 'Correct password but the account is deactivated (`USER_INACTIVE`) or unverified (`PHONE_NOT_VERIFIED`)')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionResponseDto> {
    const result = await this.commandBus.execute<LoginCommand, SessionResult>(
      new LoginCommand(dto, { userAgent: userAgent ?? null, ip: ip || null }),
    );
    return this.respondWithSession(response, result);
  }

  @Post('logout')
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSessionAuth()
  @ApiOperation({ summary: 'Sign out: ends the session and clears the cookie' })
  @ApiNoContentResponse()
  @ApiProtectedErrors()
  async logout(@CurrentPrincipal() principal: Principal, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(principal.sessionId));
    this.cookies.clear(response);
  }

  @Post('session/renew')
  @AuthenticatedOnly()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiSessionAuth()
  @ApiOperation({
    summary: 'Renew the session',
    description: 'Issues a new session identifier and restarts the idle timer. The absolute deadline does not move.',
  })
  @ApiOkResponse({ type: SessionResponseDto, headers: SET_COOKIE_HEADER })
  @ApiProtectedErrors()
  async renew(@CurrentPrincipal() principal: Principal, @Res({ passthrough: true }) response: Response): Promise<SessionResponseDto> {
    const result = await this.commandBus.execute<RenewSessionCommand, SessionResult>(new RenewSessionCommand(principal));
    return this.respondWithSession(response, result);
  }

  @Get('me')
  @AuthenticatedOnly()
  @Header('Cache-Control', 'no-store')
  @ApiSessionAuth()
  @ApiOperation({ summary: 'The signed-in user with their system role, memberships and permissions' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiProtectedErrors()
  me(@CurrentPrincipal() principal: Principal): CurrentUserResponseDto {
    return CurrentUserResponseDto.from(principal);
  }

  @Post('password/forgot')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Request a password reset code',
    description: 'Sends a code to the phone of the account. The answer is the same whether or not the account exists.',
  })
  @ApiAcceptedResponse({ type: OtpDispatchResponseDto })
  @ApiBadRequestErrors()
  @ApiErrorResponse(429, 'Code requested too often (`OTP_COOLDOWN`, `OTP_RATE_LIMITED`)')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string): Promise<OtpDispatchResponseDto> {
    return this.commandBus.execute<RequestPasswordResetCommand, OtpDispatchResponseDto>(
      new RequestPasswordResetCommand(dto, ip || null),
    );
  }

  @Post('password/reset')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Set a new password with the code sent by SMS',
    description: 'Ends the account\'s session. Sign in with the new password afterwards.',
  })
  @ApiNoContentResponse({ description: 'Password replaced' })
  @ApiBadRequestErrors('Invalid request, or the code is wrong, expired or used (`INVALID_OTP`)')
  @ApiErrorResponse(429, 'Too many wrong codes (`OTP_ATTEMPTS_EXCEEDED`)')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.commandBus.execute<ResetPasswordCommand, void>(new ResetPasswordCommand(dto));
  }

  private respondWithSession(response: Response, { session, user }: SessionResult): SessionResponseDto {
    this.cookies.write(response, session.token, session.cookieMaxAgeMs);
    return SessionResponseDto.of({ user, idleExpiresAt: session.idleExpiresAt, absoluteExpiresAt: session.absoluteExpiresAt });
  }
}
