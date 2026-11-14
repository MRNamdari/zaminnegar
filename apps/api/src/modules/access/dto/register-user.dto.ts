import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_PATTERN } from '../utils/account-identifier';
import { DefinedIfPresent } from '../validators/defined-if-present.decorator';
import { IranMobileNumber } from '../validators/iran-mobile.decorator';

const lower = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class RegisterUserDto {
  @ApiProperty({ pattern: USERNAME_PATTERN.source, minLength: 3, maxLength: 32, example: 'farmer_ali', description: 'Lower case letters, digits and "_"; not only digits. Case-insensitive.' })
  @Transform(lower)
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'username must be 3-32 characters of a-z, 0-9 and "_", and not only digits' })
  username!: string;

  @ApiProperty({ format: 'password', minLength: 10, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;

  @IranMobileNumber()
  phone!: string;

  @ApiPropertyOptional({ format: 'email', maxLength: 320, description: 'Never verified and never used to sign in' })
  @DefinedIfPresent()
  @Transform(lower)
  @IsEmail()
  @MaxLength(320)
  email?: string;
}
