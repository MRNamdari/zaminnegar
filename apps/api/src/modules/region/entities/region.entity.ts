import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
  Unique,
  VirtualColumn,
} from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { RegionStatus } from '../../../common/enums/region-status.enum';
import { IRegion } from '../../../common/interfaces/region.interface';
import { effectiveAreaSql } from '../../../common/utils/effective-area';
import { Block } from '../../block/entities/block.entity';
import { Boundary } from '../../boundary/entities/boundary.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Project } from '../../project/entities/project.entity';

@Entity({ name: 'regions' })
@Unique('uq_regions__project_id_name', ['projectId', 'name'])
@Index('ix_regions__project_id_status', ['projectId', 'status'])
export class Region extends TimestampedEntity implements IRegion {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_regions',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  /** UNIQUE (one boundary, one region): `uq_regions__boundary_id`, named by ExplicitNamingStrategy. */
  @Column({ type: 'uuid', name: 'boundary_id' })
  boundaryId!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  /**
   * Read-only: the boundary's `manualAreaM2` when set, otherwise its `computedAreaM2`. Nothing is stored on this
   * table, so the value cannot drift from the boundary.
   */
  @VirtualColumn({ type: 'double precision', query: effectiveAreaSql })
  areaM2!: number;

  @Column({
    type: 'enum',
    enum: RegionStatus,
    enumName: 'region_status',
    name: 'status',
    default: RegionStatus.active,
  })
  status!: RegionStatus;

  @ManyToOne(() => Project, (project) => project.regions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_regions__project_id__projects',
  })
  project?: Relation<Project>;

  @OneToOne(() => Boundary, (boundary) => boundary.ofRegion, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'boundary_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_regions__boundary_id__boundaries',
  })
  boundary?: Relation<Boundary>;

  @OneToMany(() => Block, (block) => block.region)
  blocks?: Relation<Block>[];

  @OneToMany(() => Parcel, (parcel) => parcel.region)
  parcels?: Relation<Parcel>[];

  /** Only set by RegionRepository.findPage (loadRelationCountAndMap). */
  blocksCount?: number;

  /** Only set by RegionRepository.findPage (loadRelationCountAndMap). */
  parcelsCount?: number;
}
