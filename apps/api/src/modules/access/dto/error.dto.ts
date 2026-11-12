import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Shape of every domain error of the access module. */
export class ErrorResponseDto {
  @ApiProperty({ example: 'INVALID_OTP', description: 'Stable machine-readable error code' })
  code!: string;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional({ description: 'Seconds until the request may be retried (429 responses)' })
  retryAfterSeconds?: number;
}

/** Shape of request-validation failures (class-validator). */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 }) statusCode!: number;
  @ApiProperty({ type: String, isArray: true, example: ['phone must be a valid Iranian mobile number'] }) message!: string[];
  @ApiProperty({ example: 'Bad Request' }) error!: string;
}
