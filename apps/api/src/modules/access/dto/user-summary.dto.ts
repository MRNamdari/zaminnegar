import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/** The signed-in account as shown right after login. */
export class UserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'farmer_ali' })
  @Expose()
  username!: string;

  @ApiProperty({ example: '+989123456789' })
  @Expose()
  phone!: string;

  @ApiProperty({ type: String, format: 'email', nullable: true })
  @Expose()
  email!: string | null;
}
