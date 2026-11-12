import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes `blocks.region_id`, `parcels.region_id` and `parcels.block_id` database-owned: they are derived from the
 * boundaries and can no longer be chosen by the application (any value written to them is overwritten).
 *
 *  - blocks:  region_id = the region of the project whose boundary contains the block's boundary.
 *  - parcels: region_id = the region containing the parcel's boundary;
 *             block_id  = the block of that region containing it, or NULL;
 *             area_m2, region_occupancy_pct and block_occupancy_pct are recomputed in the same step, so the
 *             `ck_parcels__block_occupancy_pct_iff_block_id` check can never be violated by a re-link.
 *
 * "Contains" tolerates GEOMETRY_TOLERANCE_M2 (1 m², see geometry.constants.ts) like the application rules do.
 *
 * When a boundary's geometry changes, `trg_boundaries_revalidate_references` re-derives every reference that
 * depends on it, in dependency order (regions -> blocks -> parcels):
 *  - region geometry changed: all its blocks and parcels are re-resolved; one that no longer fits in any region
 *    makes the statement fail with check_violation (DETAIL = BLOCK_NOT_IN_REGION / PARCEL_NOT_IN_REGION);
 *  - block geometry changed: the block's region is re-resolved, then its parcels, plus parcels that are in no block
 *    and touch the new outline: parcels that left the block are detached, parcels now inside it are attached;
 *  - parcel geometry changed: its region and block are re-resolved.
 *
 * Existing rows are not rewritten: they already satisfy the rules and are re-derived the next time their boundary
 * (or the boundary of anything they depend on) changes.
 */
export class ReferenceTriggers1794300000000 implements MigrationInterface {
  name = 'ReferenceTriggers1794300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION geometry_tolerance_m2() RETURNS double precision
      LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT 1::double precision $$
    `);

    // VOLATILE on purpose: called from triggers fired by cascading UPDATEs, it must see the rows those updates just wrote.
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION resolve_containing_region(p_project_id uuid, p_geom geometry) RETURNS uuid
      LANGUAGE sql VOLATILE AS $$
        SELECT r.id
          FROM regions r
          JOIN boundaries rb ON rb.id = r.boundary_id
         WHERE r.project_id = p_project_id
           AND rb.geometry && p_geom
           AND COALESCE(ST_Area(ST_Difference(p_geom, rb.geometry)::geography), 0) <= geometry_tolerance_m2()
         ORDER BY ST_Area(ST_Intersection(p_geom, rb.geometry)::geography) DESC, r.id
         LIMIT 1
      $$
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION resolve_containing_block(p_region_id uuid, p_geom geometry) RETURNS uuid
      LANGUAGE sql VOLATILE AS $$
        SELECT b.id
          FROM blocks b
          JOIN boundaries bb ON bb.id = b.boundary_id
         WHERE b.region_id = p_region_id
           AND bb.geometry && p_geom
           AND COALESCE(ST_Area(ST_Difference(p_geom, bb.geometry)::geography), 0) <= geometry_tolerance_m2()
         ORDER BY ST_Area(ST_Intersection(p_geom, bb.geometry)::geography) DESC, b.id
         LIMIT 1
      $$
    `);

    // ---- blocks ----------------------------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION blocks_assign_region() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_geom geometry;
        v_region uuid;
      BEGIN
        SELECT b.geometry INTO v_geom FROM boundaries b WHERE b.id = NEW.boundary_id;
        IF v_geom IS NULL THEN
          RAISE EXCEPTION 'block "%" has no boundary %', NEW.name, NEW.boundary_id
            USING ERRCODE = 'check_violation', DETAIL = 'BOUNDARY_NOT_FOUND';
        END IF;

        v_region := resolve_containing_region(NEW.project_id, v_geom);
        IF v_region IS NULL THEN
          RAISE EXCEPTION 'block "%" is not inside any region of its project', NEW.name
            USING ERRCODE = 'check_violation', DETAIL = 'BLOCK_NOT_IN_REGION';
        END IF;

        NEW.region_id := v_region;
        RETURN NEW;
      END;
      $$
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_blocks_assign_region
      BEFORE INSERT OR UPDATE OF boundary_id, project_id, region_id ON blocks
      FOR EACH ROW EXECUTE FUNCTION blocks_assign_region()
    `);

    // ---- parcels ---------------------------------------------------------------------------------------------
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION parcels_assign_references() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_geom geometry;
        v_area double precision;
        v_region uuid;
        v_block uuid;
        v_region_area double precision;
        v_block_area double precision;
      BEGIN
        SELECT b.geometry, b.area_m2 INTO v_geom, v_area FROM boundaries b WHERE b.id = NEW.boundary_id;
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

        SELECT rb.area_m2 INTO v_region_area
          FROM regions r JOIN boundaries rb ON rb.id = r.boundary_id WHERE r.id = v_region;

        NEW.region_id := v_region;
        NEW.block_id := v_block;
        NEW.area_m2 := v_area;
        NEW.region_occupancy_pct := LEAST(100, COALESCE(v_area / NULLIF(v_region_area, 0) * 100, 0));

        IF v_block IS NULL THEN
          NEW.block_occupancy_pct := NULL;
        ELSE
          SELECT bb.area_m2 INTO v_block_area
            FROM blocks b JOIN boundaries bb ON bb.id = b.boundary_id WHERE b.id = v_block;
          NEW.block_occupancy_pct := LEAST(100, COALESCE(v_area / NULLIF(v_block_area, 0) * 100, 0));
        END IF;
        RETURN NEW;
      END;
      $$
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_parcels_assign_references
      BEFORE INSERT OR UPDATE OF boundary_id, project_id, region_id, block_id ON parcels
      FOR EACH ROW EXECUTE FUNCTION parcels_assign_references()
    `);

    // ---- boundary geometry changes -> re-validate dependants ---------------------------------------------------
    // "UPDATE ... SET boundary_id = boundary_id" fires the BEFORE triggers above, which re-derive everything.
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION boundaries_revalidate_references() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        v_id uuid;
        v_project uuid;
      BEGIN
        SELECT r.id INTO v_id FROM regions r WHERE r.boundary_id = NEW.id;
        IF FOUND THEN
          UPDATE blocks  SET boundary_id = boundary_id WHERE region_id = v_id;
          UPDATE parcels SET boundary_id = boundary_id WHERE region_id = v_id;
          RETURN NULL;
        END IF;

        SELECT b.id, b.project_id INTO v_id, v_project FROM blocks b WHERE b.boundary_id = NEW.id;
        IF FOUND THEN
          UPDATE blocks SET boundary_id = boundary_id WHERE id = v_id;
          UPDATE parcels p SET boundary_id = p.boundary_id
           WHERE p.block_id = v_id
              OR (p.block_id IS NULL
                  AND p.project_id = v_project
                  AND EXISTS (SELECT 1 FROM boundaries pb WHERE pb.id = p.boundary_id AND pb.geometry && NEW.geometry));
          RETURN NULL;
        END IF;

        UPDATE parcels SET boundary_id = boundary_id WHERE boundary_id = NEW.id;
        RETURN NULL;
      END;
      $$
    `);
    // Named so that it fires after trg_boundaries_refresh_feature_area (triggers of one event run alphabetically).
    await queryRunner.query(`
      CREATE TRIGGER trg_boundaries_revalidate_references
      AFTER UPDATE OF geometry ON boundaries
      FOR EACH ROW
      WHEN (OLD.geometry IS DISTINCT FROM NEW.geometry)
      EXECUTE FUNCTION boundaries_revalidate_references()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_boundaries_revalidate_references ON boundaries`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS boundaries_revalidate_references()`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_parcels_assign_references ON parcels`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS parcels_assign_references()`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_blocks_assign_region ON blocks`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS blocks_assign_region()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS resolve_containing_block(uuid, geometry)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS resolve_containing_region(uuid, geometry)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS geometry_tolerance_m2()`);
  }
}
