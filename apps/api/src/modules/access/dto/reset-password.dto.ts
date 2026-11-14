import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IDENTIFIER_PATTERN, normalizeIdentifier } from '../utils/account-identifier';
import { toLatinDigits } from '../utils/iran-phone';

export class ResetPasswordDto {
  @ApiProperty({ example: 'farmer_ali', description: 'The same username or phone number that requested the code' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? normalizeIdentifier(value) : value))
  @IsString()
  @Matches(IDENTIFIER_PATTERN, { message: 'identifier must be a username or an Iranian mobile number' })
  identifier!: string;

  @ApiProperty({ pattern: '^[0-9]{6}$', example: '123456' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? toLatinDigits(value.trim()) : value))
  @Matches(/^[0-9]{6}$/, { message: 'code must be 6 digits' })
  code!: string;

  @ApiProperty({ format: 'password', minLength: 10, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  newPassword!: string;
}
