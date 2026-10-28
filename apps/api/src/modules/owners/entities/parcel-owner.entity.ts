import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParcelEntity } from '../../parcels/entities/parcel.entity';
import type { IParcel } from '../../parcels/interfaces/parcel.interface';
import type { IParcelOwner, IOwner } from '../interfaces/owner.interface';
import { PARCEL_OWNER_CONSTRAINTS, PARCEL_OWNERS_TABLE } from '../owners.constants';
import { OwnerEntity } from './owner.entity';

/** Join entity for parcel ownership shares. */
@Entity({ name: PARCEL_OWNERS_TABLE })
@Index(['ownerId', 'parcelId'])
export class ParcelOwnerEntity implements IParcelOwner {
  @PrimaryColumn({ name: 'parcel_id', type: 'uuid' })
  parcelId!: string;

  @PrimaryColumn({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column({ name: 'share', type: 'double precision' })
  share!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => ParcelEntity, (parcel) => parcel.owners, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'parcel_id', foreignKeyConstraintName: PARCEL_OWNER_CONSTRAINTS.foreignKeyParcel })
  parcel?: IParcel;

  @ManyToOne(() => OwnerEntity, (owner) => owner.parcels, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'owner_id', foreignKeyConstraintName: PARCEL_OWNER_CONSTRAINTS.foreignKeyOwner })
  owner?: IOwner;
}
