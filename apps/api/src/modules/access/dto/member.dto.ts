import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class MemberResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() userId!: string;
  @ApiProperty({ format: 'email' }) @Expose() userEmail!: string;
  @ApiProperty() @Expose() userName!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() roleId!: string;
  @ApiProperty() @Expose() roleName!: string;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;
}

export class AddMemberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ format: 'uuid', description: 'A role of scope `project`' })
  @IsUUID()
  roleId!: string;
}

export class UpdateMemberDto {
  @ApiProperty({ format: 'uuid', description: 'A role of scope `project`' })
  @IsUUID()
  roleId!: string;
}
