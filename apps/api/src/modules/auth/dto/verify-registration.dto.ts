import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import { IranMobileNumber } from '../validators/iran-mobile.decorator';
import { toLatinDigits } from '../utils/iran-phone';

export class VerifyRegistrationDto {
  @IranMobileNumber()
  phone!: string;

  @ApiProperty({ pattern: '^[0-9]{6}$', example: '123456' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? toLatinDigits(value.trim()) : value))
  @Matches(/^[0-9]{6}$/, { message: 'code must be 6 digits' })
  code!: string;
}
