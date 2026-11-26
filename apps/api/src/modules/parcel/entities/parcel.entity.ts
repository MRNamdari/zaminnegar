import {
  Check,
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
import { TimestampedEntity } from '@/common/base/timestamped.entity';
import { ParcelStatus } from '@/common/enums/parcel-status.enum';
import { IParcel } from '@/common/interfaces/parcel.interface';
import { effectiveAreaSql } from '@/common/utils/effective-area';
import { numericTransformer } from '@/database/transformers/numeric.transformer';
import { Block } from '@/modules/block/entities/block.entity';
import { Boundary } from '@/modules/boundary/entities/boundary.entity';
import { Project } from '@/modules/project/entities/project.entity';
import { Region } from '@/modules/region/entities/region.entity';
import { ParcelOwnership } from './parcel-ownership.entity';

@Entity({ name: 'parcels' })
@Unique('uq_parcels__project_id_name', ['projectId', 'name'])
@Index('ix_parcels__project_id_status', ['projectId', 'status'])
@Index('ix_parcels__region_id', ['regionId'])
@Index('ix_parcels__block_id', ['blockId'])
@Check(
  'ck_parcels__region_occupancy_pct_range',
  '"region_occupancy_pct" BETWEEN 0 AND 100',
)
@Check(
  'ck_parcels__block_occupancy_pct_range',
  '"block_occupancy_pct" IS NULL OR "block_occupancy_pct" BETWEEN 0 AND 100',
)
@Check(
  'ck_parcels__block_occupancy_pct_iff_block_id',
  '("block_id" IS NULL) = ("block_occupancy_pct" IS NULL)',
)
export class Parcel extends TimestampedEntity implements IParcel {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_parcels',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  /** Assigned by trigger `trg_parcels_assign_references`: the region containing the parcel's boundary. Never written by the ORM. */
  @Column({ type: 'uuid', name: 'region_id', insert: false, update: false })
  regionId!: string;

  /** Assigned by trigger `trg_parcels_assign_references`: the block containing the parcel's boundary, or null. Never written by the ORM. */
  @Column({
    type: 'uuid',
    name: 'block_id',
    nullable: true,
    insert: false,
    update: false,
  })
  blockId?: string | null;

  /** UNIQUE: `uq_parcels__boundary_id`, named by ExplicitNamingStrategy. */
  @Column({ type: 'uuid', name: 'boundary_id' })
  boundaryId!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  @Column({
    type: 'enum',
    enum: ParcelStatus,
    enumName: 'parcel_status',
    name: 'status',
    default: ParcelStatus.active,
  })
  status!: ParcelStatus;

  /**
   * Read-only: the boundary's `manualAreaM2` when set, otherwise its `computedAreaM2`. Nothing is stored on this
   * table, so the value cannot drift from the boundary.
   */
  @VirtualColumn({ type: 'double precision', query: effectiveAreaSql })
  areaM2!: number;

  /** Maintained by trigger `trg_parcels_assign_references`. */
  @Column({
    type: 'numeric',
    precision: 9,
    scale: 6,
    name: 'region_occupancy_pct',
    default: 0,
    transformer: numericTransformer,
  })
  regionOccupancyPct!: number;

  /** Maintained by trigger `trg_parcels_assign_references`. Null when the parcel has no block. */
  @Column({
    type: 'numeric',
    precision: 9,
    scale: 6,
    name: 'block_occupancy_pct',
    nullable: true,
    transformer: numericTransformer,
  })
  blockOccupancyPct?: number | null;

  @ManyToOne(() => Project, (project) => project.parcels, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcels__project_id__projects',
  })
  project?: Relation<Project>;

  @ManyToOne(() => Region, (region) => region.parcels, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'region_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcels__region_id__regions',
  })
  region?: Relation<Region>;

  @ManyToOne(() => Block, (block) => block.parcels, {
    nullable: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'block_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcels__block_id__blocks',
  })
  block?: Relation<Block> | null;

  @OneToOne(() => Boundary, (boundary) => boundary.ofParcel, {
    nullable: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'boundary_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcels__boundary_id__boundaries',
  })
  boundary?: Relation<Boundary>;

  @OneToMany(() => ParcelOwnership, (ownership) => ownership.parcel)
  ownerships?: Relation<ParcelOwnership>[];

  /** Only set by ParcelRepository.findPage (loadRelationCountAndMap). */
  ownershipsCount?: number;
}
