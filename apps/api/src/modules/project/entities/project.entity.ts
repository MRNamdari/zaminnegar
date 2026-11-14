import { Column, Entity, OneToMany, PrimaryColumn, Relation, Unique } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { IProject } from '../../../common/interfaces/project.interface';
import { Block } from '../../block/entities/block.entity';
import { Boundary } from '../../boundary/entities/boundary.entity';
import { Owner } from '../../owner/entities/owner.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Region } from '../../region/entities/region.entity';

@Entity({ name: 'projects' })
@Unique('uq_projects__name', ['name'])
export class Project extends TimestampedEntity implements IProject {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_projects',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  @OneToMany(() => Boundary, (boundary) => boundary.project)
  boundaries?: Relation<Boundary>[];

  @OneToMany(() => Region, (region) => region.project)
  regions?: Relation<Region>[];

  @OneToMany(() => Block, (block) => block.project)
  blocks?: Relation<Block>[];

  @OneToMany(() => Parcel, (parcel) => parcel.project)
  parcels?: Relation<Parcel>[];

  @OneToMany(() => Owner, (owner) => owner.project)
  owners?: Relation<Owner>[];
}
