import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Action, Resource } from '../permissions';

/** Global permission definition. Seeded by migrations; roles can only be granted what is defined here. */
@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'resource', primaryKeyConstraintName: 'pk_permissions' })
  resource!: Resource;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'action', primaryKeyConstraintName: 'pk_permissions' })
  action!: Action;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  /** False for permissions that only a system role may hold (`project:create`, `user:*`). */
  @Column({ type: 'boolean', name: 'project_assignable', default: false })
  projectAssignable!: boolean;
}
