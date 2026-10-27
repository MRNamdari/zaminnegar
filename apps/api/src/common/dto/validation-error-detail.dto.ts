import { ApiProperty } from '@nestjs/swagger';

/** Validation problems of a single request field. */
export class ValidationErrorDetailDto {
  @ApiProperty({ description: 'Dotted path of the invalid field.', example: 'geometry.coordinates' })
  field!: string;

  @ApiProperty({
    description: 'Every rule the field violated.',
    type: [String],
    example: ['name must be shorter than or equal to 120 characters'],
  })
  messages!: string[];
}
