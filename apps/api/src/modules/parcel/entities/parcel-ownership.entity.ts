import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { TimestampedEntity } from '../../../common/base/timestamped.entity';
import { IParcelOwnership } from '../../../common/interfaces/parcel-ownership.interface';
import { numericTransformer } from '../../../database/transformers/numeric.transformer';
import { Owner } from '../../owner/entities/owner.entity';
import { Parcel } from './parcel.entity';

@Entity({ name: 'parcel_ownerships' })
@Index('ix_parcel_ownerships__owner_id', ['ownerId'])
@Check('ck_parcel_ownerships__share_pct_range', '"share_pct" > 0 AND "share_pct" <= 100')
export class ParcelOwnership extends TimestampedEntity implements IParcelOwnership {
  @PrimaryColumn({
    type: 'uuid',
    name: 'parcel_id',
    primaryKeyConstraintName: 'pk_parcel_ownerships',
  })
  parcelId!: string;

  @PrimaryColumn({
    type: 'uuid',
    name: 'owner_id',
    primaryKeyConstraintName: 'pk_parcel_ownerships',
  })
  ownerId!: string;

  @Column({
    type: 'numeric',
    precision: 7,
    scale: 4,
    name: 'share_pct',
    transformer: numericTransformer,
  })
  sharePct!: number;

  @ManyToOne(() => Parcel, (parcel) => parcel.ownerships, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'parcel_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcel_ownerships__parcel_id__parcels',
  })
  parcel?: Relation<Parcel>;

  @ManyToOne(() => Owner, (owner) => owner.ownerships, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_parcel_ownerships__owner_id__owners',
  })
  owner?: Relation<Owner>;
}
