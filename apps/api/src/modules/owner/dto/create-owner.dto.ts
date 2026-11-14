import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerStatus } from '../../../common/enums/owner-status.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    type: 'string',
    maxLength: 50,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({
    type: 'string',
    maxLength: 320,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string | null;

  @ApiPropertyOptional({ type: 'string', nullable: true, required: false })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty()
  @IsString()
  nationalId!: string;

  @ApiProperty({ enum: OwnerStatus, default: OwnerStatus.pending })
  @IsEnum(OwnerStatus)
  status!: OwnerStatus;
}
