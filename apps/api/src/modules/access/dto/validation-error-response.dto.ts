import { ApiProperty } from '@nestjs/swagger';

/** Error body produced by request validation (ValidationPipe / ParseUUIDPipe). */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description: 'One message, or one per invalid property',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
