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
} from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { BlockStatus } from '../../../common/enums/block-status.enum';
import { IBlock } from '../../../common/interfaces/block.interface';
import { Boundary } from '../../boundary/entities/boundary.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Project } from '../../project/entities/project.entity';
import { Region } from '../../region/entities/region.entity';

@Entity({ name: 'blocks' })
@Unique('uq_blocks__region_id_name', ['regionId', 'name'])
@Index('ix_blocks__project_id', ['projectId'])
@Index('ix_blocks__region_id_status', ['regionId', 'status'])
export class Block extends TimestampedEntity implements IBlock {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_blocks',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  /**
   * Assigned by the database (trigger `trg_blocks_assign_region`): the region of the same project
   * whose boundary contains the block's boundary. Never written by the ORM.
   */
  @Column({ type: 'uuid', name: 'region_id', insert: false, update: false })
  regionId!: string;

  /** UNIQUE: `uq_blocks__boundary_id`, named by ExplicitNamingStrategy. */
  @Column({ type: 'uuid', name: 'boundary_id' })
  boundaryId!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', default: '' })
  description!: string;

  /** Maintained by ParcelRepository.recalculateMetrics (copied from the boundary). */
  @Column({ type: 'double precision', name: 'area_m2', default: 0 })
  areaM2!: number;

  @Column({
    type: 'enum',
    enum: BlockStatus,
    enumName: 'block_status',
    name: 'status',
    default: BlockStatus.active,
  })
  status!: BlockStatus;

  @ManyToOne(() => Project, (project) => project.blocks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_blocks__project_id__projects',
  })
  project?: Relation<Project>;

  @ManyToOne(() => Region, (region) => region.blocks, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'region_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_blocks__region_id__regions',
  })
  region?: Relation<Region>;

  @OneToOne(() => Boundary, (boundary) => boundary.ofBlock, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'boundary_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_blocks__boundary_id__boundaries',
  })
  boundary?: Relation<Boundary>;

  @OneToMany(() => Parcel, (parcel) => parcel.block)
  parcels?: Relation<Parcel>[];

  parcelsCount?: number;
}
