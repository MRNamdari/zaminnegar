import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, Matches } from 'class-validator';
import { USERNAME_PATTERN } from '../utils/account-identifier';

export class AddMemberDto {
  @ApiProperty({ pattern: USERNAME_PATTERN.source, example: 'farmer_ali', description: 'Username of an active, phone-verified account' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'username is not valid' })
  username!: string;

  @ApiProperty({ format: 'uuid', description: 'A predefined project role or a custom role of this project' })
  @IsUUID()
  roleId!: string;
}
