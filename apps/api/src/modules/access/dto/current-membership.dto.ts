import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PermissionDto } from './permission.dto';
import { RoleSummaryDto } from './role-summary.dto';

/** The caller's role in one project and what it grants there. Never applies to any other project. */
export class CurrentMembershipDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  projectId!: string;

  @ApiProperty({ type: () => RoleSummaryDto })
  @Expose()
  @Type(() => RoleSummaryDto)
  role!: RoleSummaryDto;

  @ApiProperty({ type: () => PermissionDto, isArray: true })
  @Expose()
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
}
