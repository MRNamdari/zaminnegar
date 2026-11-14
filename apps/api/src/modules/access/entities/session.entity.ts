import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

/**
 * The one active session of a user (`user_id` is unique). Only the SHA-256 of the opaque identifier is stored, so a
 * database leak does not leak sessions.
 */
@Entity({ name: 'sessions' })
@Unique('uq_sessions__user_id', ['userId'])
@Unique('uq_sessions__token_hash', ['tokenHash'])
@Index('ix_sessions__previous_token_hash', ['previousTokenHash'])
@Index('ix_sessions__idle_expires_at', ['idleExpiresAt'])
@Index('ix_sessions__absolute_expires_at', ['absoluteExpiresAt'])
export class Session {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_sessions',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash!: string;

  /** The identifier before the last rotation; accepted for a short grace period only. */
  @Column({
    type: 'varchar',
    length: 64,
    name: 'previous_token_hash',
    nullable: true,
  })
  previousTokenHash!: string | null;

  @Column({ type: 'timestamptz', name: 'rotated_at', default: () => 'now()' })
  rotatedAt!: Date;

  @Column({ type: 'timestamptz', name: 'last_used_at', default: () => 'now()' })
  lastUsedAt!: Date;

  @Column({ type: 'timestamptz', name: 'idle_expires_at' })
  idleExpiresAt!: Date;

  @Column({ type: 'timestamptz', name: 'absolute_expires_at' })
  absoluteExpiresAt!: Date;

  @Column({ type: 'varchar', length: 500, name: 'user_agent', nullable: true })
  userAgent!: string | null;

  @Column({ type: 'varchar', length: 45, name: 'ip', nullable: true })
  ip!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_sessions__user_id__users',
  })
  user?: Relation<User>;
}
