import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the PostGIS extension, the `projects` and `parcels` tables, and every
 * constraint / index with an explicit name (the API maps those names to domain errors).
 *
 * Index rationale
 * - `idx_parcels_geom_gist`: GiST index for spatial predicates and ST_Extent.
 * - `idx_parcels_project_id_created_at`: serves "all parcels of a project, oldest first"
 *   (the list endpoint) and the cascading FK delete without a sort step.
 * - `uq_parcels_project_id_name`: enforces unique names per project; its leading
 *   `project_id` column also covers lookups by project.
 * - `idx_projects_updated_at`: serves "most recently changed projects first".
 */
export class InitSchema1761000000000 implements MigrationInterface {
  name = 'InitSchema1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
        "name"        varchar(120) NOT NULL,
        "description" text         NOT NULL DEFAULT '',
        "created_at"  timestamptz  NOT NULL DEFAULT now(),
        "updated_at"  timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT "pk_projects" PRIMARY KEY ("id"),
        CONSTRAINT "uq_projects_name" UNIQUE ("name"),
        CONSTRAINT "chk_projects_name_not_blank" CHECK (char_length(btrim("name")) > 0)
      )`);
    await queryRunner.query(`CREATE INDEX "idx_projects_updated_at" ON "projects" ("updated_at" DESC, "id")`);

    await queryRunner.query(`
      CREATE TABLE "parcels" (
        "id"           uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "project_id"   uuid                          NOT NULL,
        "name"         varchar(120)                  NOT NULL,
        "geom"         geometry(MultiPolygon, 4326)  NOT NULL,
        "fill_color"   varchar(7)                    NOT NULL DEFAULT '#2F7D4F',
        "fill_opacity" double precision              NOT NULL DEFAULT 0.35,
        "stroke_color" varchar(7)                    NOT NULL DEFAULT '#FFFFFF',
        "stroke_width" double precision              NOT NULL DEFAULT 2,
        "notes"        text,
        "area_m2"      double precision GENERATED ALWAYS AS (ST_Area("geom"::geography)) STORED,
        "created_at"   timestamptz                   NOT NULL DEFAULT now(),
        "updated_at"   timestamptz                   NOT NULL DEFAULT now(),
        CONSTRAINT "pk_parcels" PRIMARY KEY ("id"),
        CONSTRAINT "fk_parcels_project_id" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "uq_parcels_project_id_name" UNIQUE ("project_id", "name"),
        CONSTRAINT "chk_parcels_name_not_blank" CHECK (char_length(btrim("name")) > 0),
        CONSTRAINT "chk_parcels_geom_valid" CHECK (ST_IsValid("geom")),
        CONSTRAINT "chk_parcels_fill_color" CHECK ("fill_color" ~ '^#[0-9A-Fa-f]{6}$'),
        CONSTRAINT "chk_parcels_stroke_color" CHECK ("stroke_color" ~ '^#[0-9A-Fa-f]{6}$'),
        CONSTRAINT "chk_parcels_fill_opacity" CHECK ("fill_opacity" BETWEEN 0 AND 1),
        CONSTRAINT "chk_parcels_stroke_width" CHECK ("stroke_width" BETWEEN 0.5 AND 10)
      )`);
    await queryRunner.query(`CREATE INDEX "idx_parcels_geom_gist" ON "parcels" USING GIST ("geom")`);
    await queryRunner.query(
      `CREATE INDEX "idx_parcels_project_id_created_at" ON "parcels" ("project_id", "created_at", "id")`,
    );

    // Keep projects.updated_at fresh whenever one of its parcels changes.
    await queryRunner.query(`
      CREATE FUNCTION "touch_project_updated_at"() RETURNS trigger AS $$
      BEGIN
        UPDATE "projects" SET "updated_at" = now() WHERE "id" = COALESCE(NEW."project_id", OLD."project_id");
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(`
      CREATE TRIGGER "trg_parcels_touch_project"
      AFTER INSERT OR UPDATE OR DELETE ON "parcels"
      FOR EACH ROW EXECUTE FUNCTION "touch_project_updated_at"()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER "trg_parcels_touch_project" ON "parcels"`);
    await queryRunner.query(`DROP FUNCTION "touch_project_updated_at"()`);
    await queryRunner.query(`DROP TABLE "parcels"`);
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
