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
    name: 'territory',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: SRID_WGS84,
  })
  territory!: IMultiPolygon;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => BlockEntity, (block) => block.region)
  blocks?: IBlock[];
}
