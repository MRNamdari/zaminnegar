import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import type { MemberRow } from '../repositories/project-member.repository';

export class MemberResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  projectId!: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  username!: string;

  @ApiPropertyOptional({ example: '+989123456789', description: 'Present only for yourself and for callers with system-level access' })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({ type: String, format: 'email', nullable: true, description: 'Present only for yourself and for callers with system-level access' })
  @Expose()
  email?: string | null;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  roleId!: string;

  @ApiProperty()
  @Expose()
  roleName!: string;

  @ApiProperty()
  @Expose()
  roleIsSystem!: boolean;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;

  /** Keeps only the fields the caller may read (attribute-level authorization); `'all'` keeps everything. */
  static from(row: MemberRow, allowed: 'all' | readonly string[]): MemberResponseDto {
    const visible = Object.fromEntries(Object.entries(row).filter(([field]) => allowed === 'all' || allowed.includes(field)));
    return plainToInstance(MemberResponseDto, visible, { excludeExtraneousValues: true });
  }
}
