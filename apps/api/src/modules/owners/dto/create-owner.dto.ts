import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { OWNER_LIMITS } from '../owners.constants';

/** Body of `POST /owners`. */
export class CreateOwnerDto {
  @ApiProperty({
    description: 'Owner name.',
    minLength: 1,
    maxLength: OWNER_LIMITS.nameMaxLength,
    example: 'Ali Rezaei',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(OWNER_LIMITS.nameMaxLength)
  name!: string;

  @ApiPropertyOptional({
    description: 'Owner phone number.',
    maxLength: OWNER_LIMITS.phoneMaxLength,
    example: '+989121234567',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('IR', { message: 'phone must be a valid phone number' })
  @MaxLength(OWNER_LIMITS.phoneMaxLength)
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Owner email address.',
    maxLength: OWNER_LIMITS.emailMaxLength,
    example: 'owner@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(OWNER_LIMITS.emailMaxLength)
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Free-text notes.',
    example: 'Primary owner of the west parcel.',
  })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
