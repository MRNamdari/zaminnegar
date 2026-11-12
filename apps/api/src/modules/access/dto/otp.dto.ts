import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { E164Phone } from '../access.types';
import { OTP_LENGTH } from '../otp/otp.settings';
import { toLatinDigits } from '../utils/iran-phone';
import { IranMobileNumber } from '../validators/iran-mobile.decorator';
import { LoginResponseDto } from './user.dto';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RequestOtpDto {
  @IranMobileNumber()
  phone!: E164Phone;
}

export class RequestOtpResponseDto {
  @ApiProperty({ description: 'The code stops working at this time' })
  @Expose()
  expiresAt!: Date;

  @ApiProperty({ description: 'A new code may be requested from this time on' })
  @Expose()
  resendAvailableAt!: Date;
}

export class VerifyOtpDto {
  @IranMobileNumber()
  phone!: E164Phone;

  @ApiProperty({
    minLength: OTP_LENGTH,
    maxLength: OTP_LENGTH,
    pattern: `^\\d{${OTP_LENGTH}}$`,
    example: '123456',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? toLatinDigits(value.trim()) : value,
  )
  @Matches(new RegExp(`^\\d{${OTP_LENGTH}}$`), {
    message: `code must be ${OTP_LENGTH} digits`,
  })
  code!: string;

  @ApiPropertyOptional({
    required: false,
    minLength: 1,
    maxLength: 200,
    description:
      'Display name. Only used when this verification creates the account (sign-up); ignored for existing users',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;
}

export class VerifyOtpResponseDto extends LoginResponseDto {
  @ApiProperty({
    type: 'boolean',
    description:
      'True when this verification created the account (sign-up), false for a sign-in',
  })
  @Expose()
  isNewUser!: boolean;
}
