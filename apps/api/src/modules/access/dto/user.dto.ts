import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import type { E164Phone } from '../access.types';
import { IranMobileNumber } from '../validators/iran-mobile.decorator';
import { PermissionDto } from './permission.dto';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({
    type: 'string',
    format: 'email',
    nullable: true,
    description: 'Optional secondary sign-in method',
  })
  @Expose()
  email!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
    example: '+989123456789',
    description: 'Main sign-in method, E.164',
  })
  @Expose()
  phone!: E164Phone | null;
  @ApiProperty({ type: 'string', minLength: 1, maxLength: 100 })
  @Expose()
  name!: string;
  @ApiProperty({ type: 'boolean' }) @Expose() isActive!: boolean;
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    nullable: true,
    description: 'Role of scope `global`, if any',
  })
  @Expose()
  globalRoleId!: string | null;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(user: UserResponseDto): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}

export class CreateUserDto {
  @IranMobileNumber()
  phone!: E164Phone;

  @ApiPropertyOptional({
    format: 'email',
    maxLength: 320,
    nullable: true,
    required: false,
    description:
      'Optional secondary sign-in method; required to set a password',
  })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiProperty({ type: 'string', minLength: 1, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    minLength: 8,
    maxLength: 128,
    required: false,
    format: 'password',
    description: 'For email sign-in; needs `email`',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    nullable: true,
    required: false,
    description: 'A role of scope `global`',
  })
  @IsOptional()
  @IsUUID()
  globalRoleId?: string | null;
}

export class UpdateUserDto {
  @IranMobileNumber({ required: false })
  phone?: E164Phone;

  @ApiPropertyOptional({ format: 'email', maxLength: 320, required: false })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    minLength: 8,
    maxLength: 128,
    format: 'password',
    description:
      'Needs the user to have an email. Revokes all sessions of the user',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Deactivating a user revokes all sessions',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    nullable: true,
    required: false,
    description: 'A role of scope `global`; null removes it',
  })
  @IsOptional()
  @IsUUID()
  globalRoleId?: string | null;
}

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    required: false,
    description:
      'Case-insensitive match on name or email; phone in any format (digits)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class LoginDto {
  @ApiProperty({ format: 'email', maxLength: 320 })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ format: 'password', minLength: 1, maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Send as `Authorization: Bearer <token>`. Shown once.',
  })
  @Expose()
  token!: string;

  @ApiProperty() @Expose() expiresAt!: Date;

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}

export class RoleSummaryDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty() @Expose() name!: string;
}

export class MembershipPermissionsDto {
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ type: () => RoleSummaryDto }) @Expose() role!: RoleSummaryDto;
  @ApiProperty({ type: () => PermissionDto, isArray: true })
  @Expose()
  permissions!: PermissionDto[];
}

/** What the signed-in user may do, for the client to show or hide actions. The server still enforces everything. */
export class CurrentUserResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ type: 'string', format: 'email', nullable: true })
  @Expose()
  email!: string | null;
  @ApiProperty({ type: 'string', nullable: true, example: '+989123456789' })
  @Expose()
  phone!: E164Phone | null;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty({ type: () => RoleSummaryDto, nullable: true })
  @Expose()
  globalRole!: RoleSummaryDto | null;
  @ApiProperty({
    type: () => PermissionDto,
    isArray: true,
    description: 'Granted on every project',
  })
  @Expose()
  globalPermissions!: PermissionDto[];
  @ApiProperty({ type: () => MembershipPermissionsDto, isArray: true })
  @Expose()
  memberships!: MembershipPermissionsDto[];
}
