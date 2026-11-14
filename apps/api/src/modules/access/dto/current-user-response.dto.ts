import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import type { Principal } from '../access.types';
import { CurrentMembershipDto } from './current-membership.dto';
import { PermissionDto } from './permission.dto';
import { RoleSummaryDto } from './role-summary.dto';

/** Who is signed in and everything they may do; the client can derive its UI from this. */
export class CurrentUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  username!: string;

  @ApiProperty({ example: '+989123456789' })
  @Expose()
  phone!: string;

  @ApiProperty({ type: String, format: 'email', nullable: true })
  @Expose()
  email!: string | null;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, description: 'The project chosen with PUT /auth/session/project; null until chosen' })
  @Expose()
  activeProjectId!: string | null;

  @ApiProperty({ type: () => RoleSummaryDto, nullable: true })
  @Expose()
  @Type(() => RoleSummaryDto)
  systemRole!: RoleSummaryDto | null;

  @ApiProperty({ type: () => PermissionDto, isArray: true, description: 'Granted on every project' })
  @Expose()
  @Type(() => PermissionDto)
  systemPermissions!: PermissionDto[];

  @ApiProperty({ type: () => CurrentMembershipDto, isArray: true })
  @Expose()
  @Type(() => CurrentMembershipDto)
  memberships!: CurrentMembershipDto[];

  static from(principal: Principal): CurrentUserResponseDto {
    return plainToInstance(
      CurrentUserResponseDto,
      {
        ...principal.user,
        activeProjectId: principal.activeProjectId,
        systemRole: principal.systemRole,
        systemPermissions: principal.systemPermissions,
        memberships: [...principal.memberships].map(([projectId, membership]) => ({
          projectId,
          role: membership.role,
          permissions: membership.permissions,
        })),
      },
      { excludeExtraneousValues: true },
    );
  }
}
