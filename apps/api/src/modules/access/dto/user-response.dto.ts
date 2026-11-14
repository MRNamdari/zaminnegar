import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import type { User } from '../entities/user.entity';

/** An account as administrators see it. Credentials never appear. */
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  username!: string;

  @ApiProperty({ type: String, nullable: true, example: '+989123456789' })
  @Expose()
  phone!: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true, description: 'Null until registration is finished' })
  @Expose()
  phoneVerifiedAt!: Date | null;

  @ApiProperty({ type: String, format: 'email', nullable: true })
  @Expose()
  email!: string | null;

  @ApiProperty()
  @Expose()
  isActive!: boolean;

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  @Expose()
  systemRoleId!: string | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;

  static from(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }
}
