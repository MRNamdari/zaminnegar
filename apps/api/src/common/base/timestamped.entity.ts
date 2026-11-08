import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Shared audit columns. The primary key is deliberately NOT here: its constraint name
 * (`pk_<table>`) must be unique per table, so every entity declares its own `id`.
 */
export abstract class TimestampedEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt!: Date;
}
