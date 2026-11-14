import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { RegionStatus } from '../../../common/enums/region-status.enum';

export class RegionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ enum: RegionStatus, enumName: 'RegionStatus' })
  @IsOptional()
  @IsEnum(RegionStatus)
  status?: RegionStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive match on name' })
  @IsOptional()
  @IsString()
  search?: string;
}
