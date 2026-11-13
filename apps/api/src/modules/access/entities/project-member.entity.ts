import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { Project } from '../../project/entities/project.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

/**
 * A user's membership of one project, with the one role held there. A database trigger guarantees that the
 * role is a project role that is either predefined or owned by this very project.
 */
@Entity({ name: 'project_members' })
@Index('ix_project_members__project_id', ['projectId'])
@Index('ix_project_members__role_id', ['roleId'])
export class ProjectMember extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id', primaryKeyConstraintName: 'pk_project_members' })
  userId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'project_id', primaryKeyConstraintName: 'pk_project_members' })
  projectId!: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: string;

  @ManyToOne(() => User, (user) => user.memberships, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_members__user_id__users',
  })
  user?: Relation<User>;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_members__project_id__projects',
  })
  project?: Relation<Project>;

  /** Deferred so that deleting a project can remove its members and its custom roles in one statement. */
  @ManyToOne(() => Role, { nullable: false, onDelete: 'NO ACTION', deferrable: 'INITIALLY DEFERRED' })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_project_members__role_id__roles',
  })
  role?: Relation<Role>;
}
