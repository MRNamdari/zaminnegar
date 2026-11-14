import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm';

/**
 * Every table, column, index, constraint and foreign key in this project is named
 * explicitly in the entity decorators. This strategy exists only as a deterministic,
 * readable fallback for the few names TypeORM insists on generating itself, most
 * importantly the UNIQUE constraint behind a one-to-one join column
 * (`uq_<table>__<column>`), which cannot be named through a decorator.
 *
 * Convention:
 *   primary key   pk_<table>
 *   foreign key   fk_<table>__<column(s)>__<referenced_table>
 *   unique        uq_<table>__<column(s)>
 *   index         ix_<table>__<column(s)>
 *   check         ck_<table>__<rule>
 */
export class ExplicitNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  private table(tableOrName: Table | string): string {
    const name = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return name.split('.').pop() as string;
  }

  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    void columnNames;
    return `pk_${this.table(tableOrName)}`;
  }

  uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
    return `uq_${this.table(tableOrName)}__${columnNames.join('_')}`;
  }

  relationConstraintName(tableOrName: Table | string, columnNames: string[]): string {
    return `uq_${this.table(tableOrName)}__${columnNames.join('_')}`;
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTablePath?: string,
  ): string {
    const referenced = (referencedTablePath ?? 'unknown').split('.').pop();
    return `fk_${this.table(tableOrName)}__${columnNames.join('_')}__${referenced}`;
  }

  indexName(tableOrName: Table | string, columnNames: string[]): string {
    return `ix_${this.table(tableOrName)}__${columnNames.join('_')}`;
  }

  checkConstraintName(tableOrName: Table | string, expression: string): string {
    const slug = expression.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    return `ck_${this.table(tableOrName)}__${slug}`;
  }
}
