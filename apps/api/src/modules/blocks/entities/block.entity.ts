import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ParcelEntity } from '../../parcels/entities/parcel.entity';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';
import { RegionEntity } from '../../regions/entities/region.entity';
import type { IRegion } from '../../regions/interfaces/region.interface';
import type { IBlock } from '../interfaces/block.interface';
import { BLOCK_CONSTRAINTS, BLOCK_INDEXES, BLOCK_LIMITS, BLOCKS_TABLE } from '../blocks.constants';

/** Persistence model of {@link IBlock}. */
@Entity({ name: BLOCKS_TABLE })
@Unique(BLOCK_CONSTRAINTS.uniqueRegionName, ['regionId', 'name'])
@Index(BLOCK_INDEXES.regionCreated, ['regionId', 'createdAt', 'id'])
export class BlockEntity implements IBlock {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: BLOCK_CONSTRAINTS.primaryKey,
  })
  id!: string;

  @Column({ name: 'region_id', type: 'uuid' })
  regionId!: string;

  @Column({ name: 'name', type: 'varchar', length: BLOCK_LIMITS.nameMaxLength })
  name!: string;

  @Column({ name: 'description', type: 'text', default: '' })
  description!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => RegionEntity, (region) => region.blocks, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'region_id', foreignKeyConstraintName: BLOCK_CONSTRAINTS.foreignKeyRegion })
  region?: IRegion;

  @OneToMany(() => ParcelEntity, (parcel) => parcel.block)
  parcels?: IParcel[];
}
