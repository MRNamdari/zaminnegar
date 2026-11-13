import { AddProjectMemberHandler } from './add-project-member.handler';
import { ChangeMemberRoleHandler } from './change-member-role.handler';
import { CreateProjectRoleHandler } from './create-project-role.handler';
import { DeleteProjectRoleHandler } from './delete-project-role.handler';
import { LoginHandler } from './login.handler';
import { LogoutHandler } from './logout.handler';
import { RegisterUserHandler } from './register-user.handler';
import { RemoveProjectMemberHandler } from './remove-project-member.handler';
import { RenewSessionHandler } from './renew-session.handler';
import { RequestPasswordResetHandler } from './request-password-reset.handler';
import { ResetPasswordHandler } from './reset-password.handler';
import { UpdateProjectRoleHandler } from './update-project-role.handler';
import { UpdateUserHandler } from './update-user.handler';
import { VerifyRegistrationHandler } from './verify-registration.handler';

export const AccessCommandHandlers = [
  RegisterUserHandler,
  VerifyRegistrationHandler,
  LoginHandler,
  LogoutHandler,
  RenewSessionHandler,
  RequestPasswordResetHandler,
  ResetPasswordHandler,
  UpdateUserHandler,
  CreateProjectRoleHandler,
  UpdateProjectRoleHandler,
  DeleteProjectRoleHandler,
  AddProjectMemberHandler,
  ChangeMemberRoleHandler,
  RemoveProjectMemberHandler,
];
