import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SRID_WGS84 } from '../../../common/geometry/geometry.constants';
import type { IMultiPolygon } from '../../../common/geometry/interfaces/multi-polygon.interface';
import { BlockEntity } from '../../blocks/entities/block.entity';
import type { IBlock } from '../../blocks/interfaces/block.interface';
import type { IRegion } from '../interfaces/region.interface';
import {
  REGION_CONSTRAINTS,
  REGION_INDEXES,
  REGION_LIMITS,
  REGIONS_TABLE,
} from '../regions.constants';
import { FeatureEntity } from '../../features/entities/feature.entity';
import { IFeature } from '../../features/interfaces/feature.interface';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { IProject } from '../../projects/interfaces/project.interface';
import { ParcelEntity } from '../../parcels/entities/parcel.entity';
import { IParcel } from '../../parcels/interfaces/parcel.interface';

/**
 * Persistence model of {@link IRegion}. The schema itself is created by migrations.
 * The relation is typed with the interface, and `BlockEntity` is only referenced lazily,
 * so the two entity files can import each other safely.
 */
@Entity({ name: REGIONS_TABLE })
@Unique(REGION_CONSTRAINTS.uniqueName, ['name'])
@Index(REGION_INDEXES.updatedAt, ['updatedAt'])
export class RegionEntity implements IRegion {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: REGION_CONSTRAINTS.primaryKey,
  })
  id!: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: REGION_LIMITS.nameMaxLength,
  })
  name!: string;

  @Column({ name: 'description', type: 'text', default: '' })
  description!: string;

  @Column({
    name: 'project_id',
    type: 'varchar',
  })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.regions)
  project?: IProject;

  @Column({
    name: 'feature_id',
    type: 'varchar',
  })
  featureId!: string;

  @OneToMany(() => FeatureEntity, (feature) => feature.region)
  feature?: IFeature;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => BlockEntity, (block) => block.region)
  blocks?: IBlock[];

  @OneToMany(() => ParcelEntity, (parcel) => parcel.region)
  parcels?: IParcel[];
}
