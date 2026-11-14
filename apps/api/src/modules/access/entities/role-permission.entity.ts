import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Action, Resource } from '../permissions';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity({ name: 'role_permissions' })
export class RolePermission {
  @PrimaryColumn({
    type: 'uuid',
    name: 'role_id',
    primaryKeyConstraintName: 'pk_role_permissions',
  })
  roleId!: string;

  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    name: 'resource',
    primaryKeyConstraintName: 'pk_role_permissions',
  })
  resource!: Resource;

  @PrimaryColumn({
    type: 'varchar',
    length: 50,
    name: 'action',
    primaryKeyConstraintName: 'pk_role_permissions',
  })
  action!: Action;

  @ManyToOne(() => Role, (role) => role.permissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_role_permissions__role_id__roles',
  })
  role?: Relation<Role>;

  @ManyToOne(() => Permission, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn([
    {
      name: 'resource',
      referencedColumnName: 'resource',
      foreignKeyConstraintName: 'fk_role_permissions__resource_action__permissions',
    },
    {
      name: 'action',
      referencedColumnName: 'action',
      foreignKeyConstraintName: 'fk_role_permissions__resource_action__permissions',
    },
  ])
  permission?: Relation<Permission>;
}
