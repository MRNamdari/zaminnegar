import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }
}
export class UserNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'USER_NOT_FOUND', message: `User ${id} was not found` });
  }
}
export class EmailTakenError extends ConflictException {
  constructor(email: string) {
    super({ code: 'EMAIL_TAKEN', message: `A user with the email "${email}" already exists` });
  }
}
export class RoleNotFoundError extends NotFoundException {
  constructor(id: string) {
    super({ code: 'ROLE_NOT_FOUND', message: `Role ${id} was not found` });
  }
}
export class RoleNameTakenError extends ConflictException {
  constructor(name: string) {
    super({ code: 'ROLE_NAME_TAKEN', message: `A role named "${name}" already exists` });
  }
}
export class SystemRoleImmutableError extends ConflictException {
  constructor(name: string) {
    super({ code: 'SYSTEM_ROLE_IMMUTABLE', message: `The system role "${name}" cannot be changed or deleted` });
  }
}
export class RoleScopeMismatchError extends UnprocessableEntityException {
  constructor(message: string) {
    super({ code: 'ROLE_SCOPE_MISMATCH', message });
  }
}
export class MemberNotFoundError extends NotFoundException {
  constructor(projectId: string, userId: string) {
    super({ code: 'MEMBER_NOT_FOUND', message: `User ${userId} is not a member of project ${projectId}` });
  }
}
export class MemberAlreadyExistsError extends ConflictException {
  constructor(projectId: string, userId: string) {
    super({ code: 'MEMBER_ALREADY_EXISTS', message: `User ${userId} is already a member of project ${projectId}` });
  }
}

export class PhoneTakenError extends ConflictException {
  constructor(phone: string) {
    super({ code: 'PHONE_TAKEN', message: `A user with the phone number "${phone}" already exists` });
  }
}
export class PasswordRequiresEmailError extends UnprocessableEntityException {
  constructor() {
    super({ code: 'PASSWORD_REQUIRES_EMAIL', message: 'A password can only be set on a user that has an email' });
  }
}
export class InvalidOtpError extends UnauthorizedException {
  constructor() {
    super({ code: 'INVALID_OTP', message: 'The code is invalid or has expired' });
  }
}
export class OtpAttemptsExceededError extends HttpException {
  constructor() {
    super(
      { code: 'OTP_ATTEMPTS_EXCEEDED', message: 'Too many wrong codes; request a new code' },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
export class OtpCooldownError extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super(
      { code: 'OTP_COOLDOWN', message: 'A code was sent recently; wait before requesting another', retryAfterSeconds },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
export class OtpRateLimitedError extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super(
      { code: 'OTP_RATE_LIMITED', message: 'Too many code requests; try again later', retryAfterSeconds },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
export class UserInactiveError extends ForbiddenException {
  constructor() {
    super({ code: 'USER_INACTIVE', message: 'This account has been deactivated' });
  }
}
export class SmsDeliveryError extends BadGatewayException {
  constructor() {
    super({ code: 'SMS_DELIVERY_FAILED', message: 'The verification code could not be sent; try again shortly' });
  }
}
