import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

/** An opaque bearer session. Only the SHA-256 of the token is stored, so a database leak does not leak sessions. */
@Entity({ name: 'sessions' })
@Unique('uq_sessions__token_hash', ['tokenHash'])
@Index('ix_sessions__user_id', ['userId'])
@Index('ix_sessions__expires_at', ['expiresAt'])
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

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', name: 'last_used_at', default: () => 'now()' })
  lastUsedAt!: Date;

  @Column({ type: 'varchar', length: 500, name: 'user_agent', nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt!: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_sessions__user_id__users',
  })
  user?: Relation<User>;
}
