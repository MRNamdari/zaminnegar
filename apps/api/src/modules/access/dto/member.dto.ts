import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class MemberResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() projectId!: string;
  @ApiProperty({ format: 'uuid' }) @Expose() userId!: string;
  @ApiProperty({
    type: 'string',
    format: 'email',
    nullable: true,
    required: false,
  })
  @Expose()
  userEmail!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
    required: false,
    example: '+989123456789',
  })
  @Expose()
  userPhone!: string | null;
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
