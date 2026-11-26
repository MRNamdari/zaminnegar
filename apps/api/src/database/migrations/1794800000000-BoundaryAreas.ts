import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Moves every area onto `boundaries`; regions, blocks and parcels no longer store one.
 *
 *  - boundaries: the generated `area_m2` becomes `computed_area_m2` (same expression, same data) and a nullable
 *                `manual_area_m2` is added. The API reports `manual_area_m2` when set, else `computed_area_m2`.
 *  - regions, blocks, parcels: `area_m2` is dropped (parcels also lose the `computed_area_m2` / `manual_area_m2`
 *                columns an earlier iteration of the parcel entity expected). The entities read the effective area
 *                from their boundary through a virtual column.
 *  - triggers: `features_set_area` (copy of the boundary area into regions/blocks) is removed.
 *              `parcels_assign_references` no longer writes an area; occupancy is computed from the boundaries'
 *              effective area (`manual_area_m2` when set, else `computed_area_m2`).
 *              `trg_boundaries_refresh_feature_area` and `trg_boundaries_revalidate_references` stay, and now also
 *              fire when `manual_area_m2` changes, so a manual area re-derives the occupancy of the parcels it
 *              affects (the parcel itself, or every parcel of a region/block).
 */
export class BoundaryAreas1794800000000 implements MigrationInterface {
  name = 'BoundaryAreas1794800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Triggers first: they assign the columns that are about to disappear.
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_regions_set_area ON regions`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_blocks_set_area ON blocks`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS features_set_area()`);
    // boundaries
    await queryRunner.query(`ALTER TABLE boundaries DROP CONSTRAINT IF EXISTS ck_boundaries__area_m2_non_negative`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_schema = current_schema() AND table_name = 'boundaries' AND column_name = 'area_m2'
        ) THEN
          ALTER TABLE boundaries RENAME COLUMN area_m2 TO computed_area_m2;
        END IF;
      END
      $$
    `);
    await this.renameGeneratedColumnMetadata(queryRunner, 'area_m2', 'computed_area_m2');
    await queryRunner.query(`ALTER TABLE boundaries ADD COLUMN IF NOT EXISTS manual_area_m2 double precision NULL`);
    await queryRunner.query(`
      ALTER TABLE boundaries
        ADD CONSTRAINT ck_boundaries__computed_area_m2_non_negative CHECK (computed_area_m2 >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE boundaries
        ADD CONSTRAINT ck_boundaries__manual_area_m2_non_negative CHECK (manual_area_m2 IS NULL OR manual_area_m2 >= 0)
    `);
    await this.boundaryTriggers(queryRunner, true);

    // Now that the boundaries column is renamed, re-point the parcels trigger at it and stop writing an area.
    await queryRunner.query(this.parcelsAssignReferences(false));

    // regions, blocks, parcels
    await queryRunner.query(`ALTER TABLE regions DROP COLUMN IF EXISTS area_m2`);
    await queryRunner.query(`ALTER TABLE blocks DROP COLUMN IF EXISTS area_m2`);
    await queryRunner.query(`ALTER TABLE parcels DROP CONSTRAINT IF EXISTS ck_parcels__area_m2_non_negative`);
    await queryRunner.query(`ALTER TABLE parcels DROP COLUMN IF EXISTS area_m2`);
    await queryRunner.query(`ALTER TABLE parcels DROP COLUMN IF EXISTS computed_area_m2`);
    await queryRunner.query(`ALTER TABLE parcels DROP COLUMN IF EXISTS manual_area_m2`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The per-table copies come back; the manual area is not representable there and is lost.
    await queryRunner.query(`ALTER TABLE regions ADD COLUMN area_m2 double precision NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE blocks ADD COLUMN area_m2 double precision NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE parcels ADD COLUMN area_m2 double precision NOT NULL DEFAULT 0`);
    await queryRunner.query(`
      ALTER TABLE parcels ADD CONSTRAINT ck_parcels__area_m2_non_negative CHECK (area_m2 >= 0)
    `);

    await this.boundaryTriggers(queryRunner, false);
    await queryRunner.query(`ALTER TABLE boundaries DROP CONSTRAINT IF EXISTS ck_boundaries__manual_area_m2_non_negative`);
    await queryRunner.query(`ALTER TABLE boundaries DROP CONSTRAINT IF EXISTS ck_boundaries__computed_area_m2_non_negative`);
    await queryRunner.query(`ALTER TABLE boundaries DROP COLUMN IF EXISTS manual_area_m2`);
    await queryRunner.query(`ALTER TABLE boundaries RENAME COLUMN computed_area_m2 TO area_m2`);
    await this.renameGeneratedColumnMetadata(queryRunner, 'computed_area_m2', 'area_m2');
    await queryRunner.query(`
      ALTER TABLE boundaries ADD CONSTRAINT ck_boundaries__area_m2_non_negative CHECK (area_m2 >= 0)
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION features_set_area() RETURNS trigger AS $$
      BEGIN
        SELECT COALESCE(b.area_m2, 0) INTO NEW.area_m2 FROM boundaries b WHERE b.id = NEW.boundary_id;
        IF NOT FOUND THEN
          NEW.area_m2 := 0;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_regions_set_area
      BEFORE INSERT OR UPDATE ON regions
      FOR EACH ROW EXECUTE FUNCTION features_set_area()
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_blocks_set_area
      BEFORE INSERT OR UPDATE ON blocks
      FOR EACH ROW EXECUTE FUNCTION features_set_area()
    `);
    await queryRunner.query(this.parcelsAssignReferences(true));

    // Backfill the restored columns through the triggers.
    await queryRunner.query(`UPDATE regions SET boundary_id = boundary_id`);
    await queryRunner.query(`UPDATE blocks SET boundary_id = boundary_id`);
    await queryRunner.query(`UPDATE parcels SET boundary_id = boundary_id`);
  }

  /**
   * The two AFTER UPDATE triggers on boundaries that propagate a change to the owning feature and its parcels.
   * With `includeManualArea` they also fire when `manual_area_m2` changes (occupancy depends on it); without,
   * they are as ReferenceTriggers / RecalculateSpatialReferences defined them (geometry only).
   */
  private async boundaryTriggers(queryRunner: QueryRunner, includeManualArea: boolean): Promise<void> {
    const of = includeManualArea ? 'geometry, manual_area_m2' : 'geometry';
    const when = includeManualArea
      ? 'OLD.geometry IS DISTINCT FROM NEW.geometry OR OLD.manual_area_m2 IS DISTINCT FROM NEW.manual_area_m2'
      : 'OLD.geometry IS DISTINCT FROM NEW.geometry';
    for (const [name, fn] of [
      ['trg_boundaries_refresh_feature_area', 'boundaries_refresh_feature_area'],
      ['trg_boundaries_revalidate_references', 'boundaries_revalidate_parcels'],
    ]) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS ${name} ON boundaries`);
      await queryRunner.query(`
        CREATE TRIGGER ${name}
        AFTER UPDATE OF ${of} ON boundaries
        FOR EACH ROW
        WHEN (${when})
        EXECUTE FUNCTION ${fn}()
      `);
    }
  }

  /**
   * TypeORM remembers the expression of a generated column in its `typeorm_metadata` table, keyed by column name.
   * Renaming the column has to rename that row too, otherwise the next `migration:generate` sees a missing
   * generated column and proposes dropping and re-adding it.
   */
  private async renameGeneratedColumnMetadata(queryRunner: QueryRunner, from: string, to: string): Promise<void> {
    await queryRunner.query(
      `
      DO $$
      BEGIN
        IF to_regclass('typeorm_metadata') IS NOT NULL THEN
          UPDATE typeorm_metadata
             SET name = '${to}'
           WHERE type = 'GENERATED_COLUMN' AND "table" = 'boundaries' AND name = '${from}';
        END IF;
      END
      $$
      `,
    );
  }

  /**
   * `parcels_assign_references()` as defined by ReferenceTriggers1794300000000. Up: occupancy from the boundaries'
   * effective area (`manual_area_m2` when set, else `computed_area_m2`), no area written to `parcels`.
   * Down (`withArea`): the original, reading `boundaries.area_m2` and writing `parcels.area_m2`.
   */
  private parcelsAssignReferences(withArea: boolean): string {
    const area = (alias: string) =>
      withArea ? `${alias}.area_m2` : `COALESCE(${alias}.manual_area_m2, ${alias}.computed_area_m2)`;
    return `
      CREATE OR REPLACE FUNCTION parcels_assign_references() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_geom geometry;
        v_area double precision;
        v_region uuid;
        v_block uuid;
        v_region_area double precision;
        v_block_area double precision;
      BEGIN
        SELECT b.geometry, ${area('b')} INTO v_geom, v_area FROM boundaries b WHERE b.id = NEW.boundary_id;
        IF v_geom IS NULL THEN
          RAISE EXCEPTION 'parcel "%" has no boundary %', NEW.name, NEW.boundary_id
            USING ERRCODE = 'check_violation', DETAIL = 'BOUNDARY_NOT_FOUND';
        END IF;

        v_region := resolve_containing_region(NEW.project_id, v_geom);
        IF v_region IS NULL THEN
          RAISE EXCEPTION 'parcel "%" is not inside any region of its project', NEW.name
            USING ERRCODE = 'check_violation', DETAIL = 'PARCEL_NOT_IN_REGION';
        END IF;
        v_block := resolve_containing_block(v_region, v_geom);

        SELECT ${area('rb')} INTO v_region_area
          FROM regions r JOIN boundaries rb ON rb.id = r.boundary_id WHERE r.id = v_region;

        NEW.region_id := v_region;
        NEW.block_id := v_block;${withArea ? '\n        NEW.area_m2 := v_area;' : ''}
        NEW.region_occupancy_pct := LEAST(100, COALESCE(v_area / NULLIF(v_region_area, 0) * 100, 0));

        IF v_block IS NULL THEN
          NEW.block_occupancy_pct := NULL;
        ELSE
          SELECT ${area('bb')} INTO v_block_area
            FROM blocks b JOIN boundaries bb ON bb.id = b.boundary_id WHERE b.id = v_block;
          NEW.block_occupancy_pct := LEAST(100, COALESCE(v_area / NULLIF(v_block_area, 0) * 100, 0));
        END IF;
        RETURN NEW;
      END;
      $$
    `;
  }
}
