import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/** A sent one-time code. Only its keyed HMAC is stored. Rows are single-use, short-lived and purged after a day. */
@Entity({ name: 'otp_challenges' })
@Index('ix_otp_challenges__phone_created_at', ['phone', 'createdAt'])
@Index('ix_otp_challenges__ip_created_at', ['ip', 'createdAt'])
@Index('ix_otp_challenges__created_at', ['createdAt'])
export class OtpChallenge {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_otp_challenges', default: () => 'gen_random_uuid()' })
  id!: string;

  /** E.164, e.g. `+989123456789`. */
  @Column({ type: 'varchar', length: 13, name: 'phone' })
  phone!: string;

  @Column({ type: 'varchar', length: 64, name: 'code_hash' })
  codeHash!: string;

  @Column({ type: 'int', name: 'attempts', default: 0 })
  attempts!: number;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  /** Set when the code was used, superseded by a newer one, or exhausted its attempts. */
  @Column({ type: 'timestamptz', name: 'consumed_at', nullable: true })
  consumedAt!: Date | null;

  @Column({ type: 'varchar', length: 45, name: 'ip', nullable: true })
  ip!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;
}
