import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { IBlock } from '../../../common/interfaces/block.interface';

export class BlockResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() regionId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() boundaryId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() description!: string;
  @ApiProperty({ enum: BlockStatus, enumName: 'BlockStatus' }) @Expose() status!: BlockStatus;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(block: IBlock): BlockResponseDto {
    return plainToInstance(BlockResponseDto, block, { excludeExtraneousValues: true });
  }
}
