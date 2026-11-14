import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Keeps regions.area_m2 and blocks.area_m2 in sync with the generated area of their boundary,
 * the same way ParcelMetricsTriggers does for parcels:
 *  - BEFORE INSERT/UPDATE on regions and on blocks copies boundaries.area_m2 into area_m2;
 *  - AFTER UPDATE OF geometry on boundaries re-touches the region/block that owns that boundary.
 *
 * The columns are added when missing; if they already exist, they are left as they are.
 */
export class RegionBlockAreaTriggers1731110400001 implements MigrationInterface {
  name = 'RegionBlockAreaTriggers1731110400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE regions ADD COLUMN IF NOT EXISTS area_m2 double precision NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE blocks ADD COLUMN IF NOT EXISTS area_m2 double precision NOT NULL DEFAULT 0`);

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

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION boundaries_refresh_feature_area() RETURNS trigger AS $$
      BEGIN
        -- Re-assigning boundary_id fires the BEFORE UPDATE triggers above.
        UPDATE regions SET boundary_id = boundary_id WHERE boundary_id = NEW.id;
        UPDATE blocks  SET boundary_id = boundary_id WHERE boundary_id = NEW.id;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_boundaries_refresh_feature_area
      AFTER UPDATE OF geometry ON boundaries
      FOR EACH ROW
      WHEN (OLD.geometry IS DISTINCT FROM NEW.geometry)
      EXECUTE FUNCTION boundaries_refresh_feature_area()
    `);

    // Backfill existing rows through the new triggers.
    await queryRunner.query(`UPDATE regions SET boundary_id = boundary_id`);
    await queryRunner.query(`UPDATE blocks SET boundary_id = boundary_id`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_boundaries_refresh_feature_area ON boundaries`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS boundaries_refresh_feature_area()`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_blocks_set_area ON blocks`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_regions_set_area ON regions`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS features_set_area()`);
    // area_m2 columns are kept: they may predate this migration.
  }
}
