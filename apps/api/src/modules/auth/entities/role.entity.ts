import { Check, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { Project } from '../../project/entities/project.entity';
import { RoleScope } from '../permissions';
import { RolePermission } from './role-permission.entity';

/**
 * Predefined roles (`is_system`, no project) are seeded by migrations and shared. Custom roles belong to exactly
 * one project (`project_id`) and are deleted with it, so a project's roles can never leak into another project.
 */
@Entity({ name: 'roles' })
@Index('uq_roles__name_predefined', ['name'], { unique: true, where: '"project_id" IS NULL' })
@Index('uq_roles__project_id_name', ['projectId', 'name'], { unique: true, where: '"project_id" IS NOT NULL' })
@Index('ix_roles__project_id', ['projectId'])
@Check('ck_roles__custom_roles_are_project_scoped', `"project_id" IS NULL OR ("scope" = 'project' AND NOT "is_system")`)
export class Role extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_roles', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  @Column({ type: 'enum', enum: RoleScope, enumName: 'role_scope', name: 'scope' })
  scope!: RoleScope;

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  @Column({ type: 'uuid', name: 'project_id', nullable: true })
  projectId!: string | null;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_roles__project_id__projects',
  })
  project?: Relation<Project> | null;

  @OneToMany(() => RolePermission, (permission) => permission.role)
  permissions?: Relation<RolePermission>[];
}
