import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Envelope of every error raised by application code. */
export class ErrorResponseDto {
  @ApiProperty({ example: 'PERMISSION_DENIED', description: 'Stable, machine-readable code' })
  code!: string;

  @ApiProperty({ example: 'You do not have permission to perform this action' })
  message!: string;

  @ApiPropertyOptional({ description: 'Present on rate-limit errors (429): seconds until a retry can succeed' })
  retryAfterSeconds?: number;
}
