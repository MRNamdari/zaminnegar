import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';

/**
 * Identical whether or not a message was actually sent (it is not for unknown or already registered accounts), so
 * the response cannot be used to find out which accounts exist.
 */
export class OtpDispatchResponseDto {
  @ApiProperty({ description: 'The code stops working at this time' })
  @Expose()
  expiresAt!: Date;

  @ApiProperty({ description: 'A new code can be requested from this time' })
  @Expose()
  resendAvailableAt!: Date;

  static of(source: { expiresAt: Date; resendAvailableAt: Date }): OtpDispatchResponseDto {
    return plainToInstance(OtpDispatchResponseDto, source, { excludeExtraneousValues: true });
  }
}
