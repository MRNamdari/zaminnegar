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
import type { IParcelOwner, IOwner } from '../interfaces/owner.interface';
import { ParcelOwnerEntity } from './parcel-owner.entity';
import { OWNER_CONSTRAINTS, OWNER_INDEXES, OWNER_LIMITS, OWNERS_TABLE } from '../owners.constants';

/** Persistence model of {@link IOwner}. */
@Entity({ name: OWNERS_TABLE })
@Unique(OWNER_CONSTRAINTS.uniqueName, ['name'])
@Index(OWNER_INDEXES.updatedAt, ['updatedAt'])
export class OwnerEntity implements IOwner {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: OWNER_CONSTRAINTS.primaryKey,
  })
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: OWNER_LIMITS.nameMaxLength })
  name!: string;

  @Column({ name: 'phone', type: 'varchar', length: OWNER_LIMITS.phoneMaxLength, nullable: true })
  phone?: string | null;

  @Column({ name: 'email', type: 'varchar', length: OWNER_LIMITS.emailMaxLength, nullable: true })
  email?: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ParcelOwnerEntity, (parcelOwner) => parcelOwner.owner)
  parcels?: IParcelOwner[];
}
