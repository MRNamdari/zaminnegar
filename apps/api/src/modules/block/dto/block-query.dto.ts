import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { BlockStatus } from '../../../common/enums/block-status.enum';

export class BlockQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ enum: BlockStatus, enumName: 'BlockStatus' })
  @IsOptional()
  @IsEnum(BlockStatus)
  status?: BlockStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive match on name' })
  @IsOptional()
  @IsString()
  search?: string;
}
