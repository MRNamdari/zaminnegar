import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { IOwner } from '../../../common/interfaces/owner.interface';
import { ParcelOwnership } from '../../parcel/entities/parcel-ownership.entity';
import { Project } from '../../project/entities/project.entity';

@Entity({ name: 'owners' })
@Index('ix_owners__project_id', ['projectId'])
@Index('ix_owners__project_id_name', ['projectId', 'name'])
export class Owner extends TimestampedEntity implements IOwner {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_owners',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 50, name: 'phone', nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 320, name: 'email', nullable: true })
  email?: string | null;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes?: string | null;

  @ManyToOne(() => Project, (project) => project.owners, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_owners__project_id__projects',
  })
  project?: Relation<Project>;

  @OneToMany(() => ParcelOwnership, (ownership) => ownership.owner)
  ownerships?: Relation<ParcelOwnership>[];
}
