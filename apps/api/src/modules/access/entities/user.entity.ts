import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Relation, Unique } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { ProjectMember } from './project-member.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
@Unique('uq_users__email', ['email'])
@Index('ix_users__global_role_id', ['globalRoleId'])
export class User extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_users', default: () => 'gen_random_uuid()' })
  id!: string;

  /** Stored lower-cased. */
  @Column({ type: 'varchar', length: 320, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  /** `scrypt:<salt>:<hash>`; never selected by default and never returned by the API. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash', select: false })
  passwordHash!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  /** Role of scope `global`, e.g. `admin`; null for ordinary users, who only act through project memberships. */
  @Column({ type: 'uuid', name: 'global_role_id', nullable: true })
  globalRoleId!: string | null;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'global_role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_users__global_role_id__roles',
  })
  globalRole?: Relation<Role> | null;

  @OneToMany(() => ProjectMember, (member) => member.user)
  memberships?: Relation<ProjectMember>[];
}
