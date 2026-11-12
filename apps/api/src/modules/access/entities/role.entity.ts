import { Column, Entity, OneToMany, PrimaryColumn, Relation, Unique } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { RoleScope } from '../permissions';
import { RolePermission } from './role-permission.entity';

@Entity({ name: 'roles' })
@Unique('uq_roles__name', ['name'])
export class Role extends TimestampedEntity {
  @PrimaryColumn({ type: 'uuid', name: 'id', primaryKeyConstraintName: 'pk_roles', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  @Column({ type: 'enum', enum: RoleScope, enumName: 'role_scope', name: 'scope' })
  scope!: RoleScope;

  /** System roles (seeded by the migration) cannot be renamed, re-scoped or deleted. */
  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  @OneToMany(() => RolePermission, (permission) => permission.role)
  permissions?: Relation<RolePermission>[];
}
