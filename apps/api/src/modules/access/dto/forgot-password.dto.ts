import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { IDENTIFIER_PATTERN, normalizeIdentifier } from '../utils/account-identifier';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'farmer_ali',
    description: 'Username, or phone number in any common Iranian format (normalised to E.164)',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? normalizeIdentifier(value) : value))
  @IsString()
  @Matches(IDENTIFIER_PATTERN, { message: 'identifier must be a username or an Iranian mobile number' })
  identifier!: string;
}
