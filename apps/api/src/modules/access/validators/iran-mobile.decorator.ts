import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Matches } from 'class-validator';
import { normalizeIranMobile } from '../utils/iran-phone';

export const E164_IRAN_MOBILE = /^\+989\d{9}$/;

/**
 * An Iranian mobile number. Clients may send `09123456789`, `+989123456789`, `989123456789`, Persian digits, spaces…;
 * after transformation the property always holds the E.164 form (`+989123456789`) or fails validation.
 */
export function IranMobileNumber(options: { required?: boolean } = {}): PropertyDecorator {
  const required = options.required ?? true;
  return applyDecorators(
    ApiProperty({
      required,
      type: 'string',
      example: '09123456789',
      pattern: '^(?:\\+98|0098|98|0)?9\\d{9}$',
      description: 'Iranian mobile number in any common format; stored and returned as E.164 (`+989123456789`)',
    }),
    ...(required ? [] : [IsOptional()]),
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? (normalizeIranMobile(value) ?? value) : value)),
    Matches(E164_IRAN_MOBILE, { message: 'phone must be a valid Iranian mobile number' }),
  );
}
