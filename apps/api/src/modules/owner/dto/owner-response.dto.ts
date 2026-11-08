import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { IOwner } from '../../../common/interfaces/owner.interface';
import { OwnerStatus } from '../../../common/enums/owner-status.enum';

export class OwnerResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty({ nullable: true }) @Expose() phone?: string | null;
  @ApiProperty({ nullable: true }) @Expose() email?: string | null;
  @ApiProperty({ nullable: true }) @Expose() notes?: string | null;
  @ApiProperty() @Expose() nationalId!: string;
  @ApiProperty() @Expose() status!: OwnerStatus;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;

  static from(owner: IOwner): OwnerResponseDto {
    return plainToInstance(OwnerResponseDto, owner, {
      excludeExtraneousValues: true,
    });
  }
}
