import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ParcelEntity } from '../../parcels/entities/parcel.entity';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';
import type { IProject } from '../interfaces/project.interface';
import {
  PROJECT_CONSTRAINTS,
  PROJECT_INDEXES,
  PROJECT_LIMITS,
  PROJECTS_TABLE,
} from '../projects.constants';
import { FeatureEntity } from '../../features/entities/feature.entity';
import { IFeature } from '../../features/interfaces/feature.interface';
import { IBlock } from '../../blocks/interfaces/block.interface';
import { IRegion } from '../../regions/interfaces/region.interface';
import { RegionEntity } from '../../regions/entities/region.entity';
import { BlockEntity } from '../../blocks/entities/block.entity';

/**
 * Persistence model of {@link IProject}. The schema itself is created by migrations.
 * The relation is typed with the interface (not the entity), and `ParcelEntity` is only
 * referenced lazily, so the two entity files can import each other safely.
 */
@Entity({ name: PROJECTS_TABLE })
@Unique(PROJECT_CONSTRAINTS.uniqueName, ['name'])
@Index(PROJECT_INDEXES.updatedAt, ['updatedAt'])
export class ProjectEntity implements IProject {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: PROJECT_CONSTRAINTS.primaryKey,
  })
  id!: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: PROJECT_LIMITS.nameMaxLength,
  })
  name!: string;

  @Column({ name: 'description', type: 'text', default: '' })
  description!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => FeatureEntity, (feature) => feature.project)
  features?: IFeature[];

  @OneToMany(() => RegionEntity, (region) => region.project)
  regions?: IRegion[];

  @OneToMany(() => BlockEntity, (block) => block.project)
  blocks?: IBlock[];

  @OneToMany(() => ParcelEntity, (parcel) => parcel.project)
  parcels?: IParcel[];
}
