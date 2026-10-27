import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Uniform error envelope returned for every non-2xx response. */
export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code.', example: 404 })
  statusCode!: number;

  @ApiProperty({
    description: 'Stable machine-readable error code.',
    example: 'PROJECT_NOT_FOUND',
  })
  code!: string;

  @ApiProperty({ description: 'Human-readable explanation.', example: 'Project not found.' })
  message!: string;

  @ApiPropertyOptional({
    description: 'Structured context, e.g. an array of ValidationErrorDetailDto for 400 responses.',
    nullable: true,
    example: null,
  })
  details?: unknown;

  @ApiProperty({ description: 'Request path.', example: '/api/v1/projects/5f0c…' })
  path!: string;

  @ApiProperty({ description: 'ISO 8601 time the error was produced.', example: '2026-10-27T09:30:00.000Z' })
  timestamp!: string;
}
