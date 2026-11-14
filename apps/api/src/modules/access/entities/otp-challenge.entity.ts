import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { User } from './user.entity';

export enum OtpPurpose {
  registration = 'registration',
  passwordReset = 'password_reset',
}

/**
 * A one-time code. Only its keyed HMAC is stored. Rows are single-use and short-lived, and are also written for
 * requests that name no real account (nothing is sent for those), so limits and error behaviour look identical
 * whether or not the account exists. Purged after a day.
 */
@Entity({ name: 'otp_challenges' })
@Index('ix_otp_challenges__subject_key_created_at', ['subjectKey', 'createdAt'])
@Index('ix_otp_challenges__ip_created_at', ['ip', 'createdAt'])
@Index('ix_otp_challenges__created_at', ['createdAt'])
export class OtpChallenge {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_otp_challenges', default: () => 'gen_random_uuid()' })
  id!: string;

  /** What the rate limits are counted on: the E.164 phone, or `username:<name>` when no phone is known. */
  @Column({ type: 'varchar', length: 80, name: 'subject_key' })
  subjectKey!: string;

  @Column({ type: 'enum', enum: OtpPurpose, enumName: 'otp_purpose', name: 'purpose' })
  purpose!: OtpPurpose;

  /** The account the code was issued for; null for decoys, which can never succeed. */
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

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

  /** SET NULL, not CASCADE: deleting a pending registration must not erase the rate-limit history. */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_otp_challenges__user_id__users',
  })
  user?: Relation<User> | null;
}
