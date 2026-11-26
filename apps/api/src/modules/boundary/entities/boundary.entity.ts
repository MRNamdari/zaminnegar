import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { IBoundary } from '../../../common/interfaces/boundary.interface';
import { IMultiPolygon } from '../../../common/interfaces/geometry.interface';
import { Block } from '../../block/entities/block.entity';
import { Parcel } from '../../parcel/entities/parcel.entity';
import { Project } from '../../project/entities/project.entity';
import { Region } from '../../region/entities/region.entity';

@Entity({ name: 'boundaries' })
@Index('ix_boundaries__project_id', ['projectId'])
@Check('ck_boundaries__computed_area_m2_non_negative', '"computed_area_m2" >= 0')
@Check('ck_boundaries__manual_area_m2_non_negative', '"manual_area_m2" IS NULL OR "manual_area_m2" >= 0')
export class Boundary extends TimestampedEntity implements IBoundary {
  @PrimaryColumn({
    type: 'uuid',
    name: 'id',
    primaryKeyConstraintName: 'pk_boundaries',
    default: () => 'gen_random_uuid()',
  })
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'varchar', length: 200, name: 'name' })
  name!: string;

  /** TypeORM reads/writes PostGIS geometry as GeoJSON, so no transformer is needed. */
  @Index('ix_boundaries__geometry', { spatial: true })
  @Column({
    type: 'geometry',
    name: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: false,
  })
  geometry!: IMultiPolygon;

  /** Geodesic area computed by Postgres from the geometry; never written by the application. Re-read after save. */
  @Column({
    type: 'double precision',
    name: 'computed_area_m2',
    asExpression: 'ST_Area(geometry::geography)',
    generatedType: 'STORED',
    insert: false,
    update: false,
  })
  computedAreaM2!: number;

  /** Optional area assigned by the user. Null unless supplied; responses then fall back to `computedAreaM2`. */
  @Column({ type: 'double precision', name: 'manual_area_m2', nullable: true })
  manualAreaM2!: number | null;

  @ManyToOne(() => Project, (project) => project.boundaries, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_boundaries__project_id__projects',
  })
  project?: Relation<Project>;

  @OneToOne(() => Region, (region) => region.boundary)
  ofRegion?: Relation<Region>;

  @OneToOne(() => Block, (block) => block.boundary)
  ofBlock?: Relation<Block>;

  @OneToOne(() => Parcel, (parcel) => parcel.boundary)
  ofParcel?: Relation<Parcel>;
}
