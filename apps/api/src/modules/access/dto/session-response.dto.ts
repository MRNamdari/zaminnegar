import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { UserSummaryDto } from './user-summary.dto';

/** Describes the session. The identifier itself travels only in the HTTP-only cookie, never in a body. */
export class SessionResponseDto {
  @ApiProperty({ type: () => UserSummaryDto })
  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @ApiProperty({ description: 'The session ends here unless it is used before' })
  @Expose()
  idleExpiresAt!: Date;

  @ApiProperty({ description: 'The session ends here no matter how active it is' })
  @Expose()
  absoluteExpiresAt!: Date;

  static of(source: { user: UserSummaryDto; idleExpiresAt: Date; absoluteExpiresAt: Date }): SessionResponseDto {
    return plainToInstance(SessionResponseDto, source, { excludeExtraneousValues: true });
  }
}
