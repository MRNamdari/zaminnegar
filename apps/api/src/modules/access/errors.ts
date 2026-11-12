import { ConflictException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';

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
