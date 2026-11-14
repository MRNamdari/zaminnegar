import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Recalculate spatial references when a region or block is added or its boundary changes.
 * A new block can claim existing parcels with no block; a new/changed region can similarly
 * re-resolve its blocks and parcels. Parcel boundary changes are revalidated independently.
 */
export class RecalculateSpatialReferences1794679916994 implements MigrationInterface {
  name = 'RecalculateSpatialReferences1794679916994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION regions_recalculate_references() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_geom geometry;
      BEGIN
        SELECT b.geometry INTO v_geom FROM boundaries b WHERE b.id = NEW.boundary_id;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'region "%" has no boundary %', NEW.name, NEW.boundary_id
            USING ERRCODE = 'check_violation', DETAIL = 'BOUNDARY_NOT_FOUND';
        END IF;

        UPDATE blocks b
           SET boundary_id = b.boundary_id
          FROM boundaries bb
         WHERE b.project_id = NEW.project_id
           AND bb.id = b.boundary_id
           AND (b.region_id = NEW.id OR bb.geometry && v_geom);

        UPDATE parcels p
           SET boundary_id = p.boundary_id
          FROM boundaries pb
         WHERE p.project_id = NEW.project_id
           AND pb.id = p.boundary_id
           AND (p.region_id = NEW.id OR pb.geometry && v_geom);
        RETURN NULL;
      END;
      $$;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_regions_recalculate_references
      AFTER INSERT OR UPDATE OF boundary_id, project_id ON regions
      FOR EACH ROW EXECUTE FUNCTION regions_recalculate_references()
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION blocks_recalculate_parcels() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_geom geometry;
      BEGIN
        SELECT b.geometry INTO v_geom FROM boundaries b WHERE b.id = NEW.boundary_id;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'block "%" has no boundary %', NEW.name, NEW.boundary_id
            USING ERRCODE = 'check_violation', DETAIL = 'BOUNDARY_NOT_FOUND';
        END IF;

        UPDATE parcels p
           SET boundary_id = p.boundary_id
          FROM boundaries pb
         WHERE p.project_id = NEW.project_id
           AND pb.id = p.boundary_id
           AND (p.block_id = NEW.id OR pb.geometry && v_geom);
        RETURN NULL;
      END;
      $$;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_blocks_recalculate_parcels
      AFTER INSERT OR UPDATE OF boundary_id, project_id, region_id ON blocks
      FOR EACH ROW EXECUTE FUNCTION blocks_recalculate_parcels()
    `);

    // Parent geometry updates are propagated by trg_boundaries_refresh_feature_area,
    // which re-touches the owning region/block and fires the row triggers above.
    // The old boundary trigger remains necessary only for parcel boundaries.
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_boundaries_revalidate_references ON boundaries
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION boundaries_revalidate_parcels() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE parcels SET boundary_id = boundary_id WHERE boundary_id = NEW.id;
        RETURN NULL;
      END;
      $$;
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_boundaries_revalidate_references
      AFTER UPDATE OF geometry ON boundaries
      FOR EACH ROW
      WHEN (OLD.geometry IS DISTINCT FROM NEW.geometry)
      EXECUTE FUNCTION boundaries_revalidate_parcels()
    `);

    // Re-derive existing rows so parcels already covered by a block are linked immediately.
    await queryRunner.query(`UPDATE regions SET boundary_id = boundary_id`);
    await queryRunner.query(`UPDATE blocks SET boundary_id = boundary_id`);
    await queryRunner.query(`UPDATE parcels SET boundary_id = boundary_id`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_boundaries_revalidate_references ON boundaries
    `);
    await queryRunner.query(`DROP FUNCTION IF EXISTS boundaries_revalidate_parcels()`);
    await queryRunner.query(`
      CREATE TRIGGER trg_boundaries_revalidate_references
      AFTER UPDATE OF geometry ON boundaries
      FOR EACH ROW
      WHEN (OLD.geometry IS DISTINCT FROM NEW.geometry)
      EXECUTE FUNCTION boundaries_revalidate_references()
    `);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_blocks_recalculate_parcels ON blocks`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS blocks_recalculate_parcels()`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_regions_recalculate_references ON regions`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS regions_recalculate_references()`);
  }
}
