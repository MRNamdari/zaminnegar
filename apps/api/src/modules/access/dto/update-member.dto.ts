import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({ format: 'uuid', description: 'A predefined project role or a custom role of this project' })
  @IsUUID()
  roleId!: string;
}
