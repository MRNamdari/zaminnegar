import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Relation, Unique } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import type { E164Phone } from '../access.types';
import { ProjectMember } from './project-member.entity';
import { Role } from './role.entity';

/**
 * An account. It is usable only when `phone_verified_at` is set (registration finished) and `is_active` is true;
 * deactivation is the "soft delete": the row, its memberships and its history stay.
 */
@Entity({ name: 'users' })
@Unique('uq_users__username', ['username'])
@Unique('uq_users__phone', ['phone'])
@Index('ix_users__system_role_id', ['systemRoleId'])
@Check('ck_users__username_format', `"username" ~ '^[a-z0-9_]{3,32}$'`)
@Check('ck_users__phone_format', `"phone" IS NULL OR "phone" ~ '^\\+989[0-9]{9}$'`)
@Check('ck_users__phone_required_when_verified', `"phone_verified_at" IS NULL OR "phone" IS NOT NULL`)
export class User extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_users', default: () => 'gen_random_uuid()' })
  id!: string;

  /** Lower-case, 3-32 chars of `a-z0-9_`. */
  @Column({ type: 'varchar', length: 32, name: 'username' })
  username!: string;

  /** E.164 Iranian mobile. Null only for accounts that predate phone registration. */
  @Column({ type: 'varchar', length: 13, name: 'phone', nullable: true })
  phone!: E164Phone | null;

  @Column({ type: 'timestamptz', name: 'phone_verified_at', nullable: true })
  phoneVerifiedAt!: Date | null;

  /** Optional and never verified: it identifies nothing and grants nothing. */
  @Column({ type: 'varchar', length: 320, name: 'email', nullable: true })
  email!: string | null;

  /** Argon2id PHC string. Never selected by default and never returned by the API. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash', nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'int', name: 'failed_login_count', default: 0 })
  failedLoginCount!: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil!: Date | null;

  /** A role of scope `system`; null for users without system-level permissions. */
  @Column({ type: 'uuid', name: 'system_role_id', nullable: true })
  systemRoleId!: string | null;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'system_role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_users__system_role_id__roles',
  })
  systemRole?: Relation<Role> | null;

  @OneToMany(() => ProjectMember, (member) => member.user)
  memberships?: Relation<ProjectMember>[];
}
