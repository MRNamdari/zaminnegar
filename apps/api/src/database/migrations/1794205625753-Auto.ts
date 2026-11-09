import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1794205625753 implements MigrationInterface {
    name = 'Auto1794205625753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships" DROP CONSTRAINT "fk_parcel_ownerships__owner_id__owners"
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."owners_status_enum"
            RENAME TO "owners_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."owners_status_enum" AS ENUM('active', 'inactive', 'pending')
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "status" TYPE "public"."owners_status_enum" USING "status"::"text"::"public"."owners_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."owners_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "owners" DROP CONSTRAINT "fk_owners__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "regions" DROP CONSTRAINT "fk_regions__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries" DROP CONSTRAINT "fk_boundaries__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships" DROP CONSTRAINT "fk_parcel_ownerships__parcel_id__parcels"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "regions" DROP CONSTRAINT "fk_regions__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__block_id__blocks"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__region_id__regions"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__region_id__regions"
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ALTER COLUMN "id"
            SET DEFAULT gen_random_uuid()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships"
            ADD CONSTRAINT "fk_parcel_ownerships__parcel_id__parcels" FOREIGN KEY ("parcel_id") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships"
            ADD CONSTRAINT "fk_parcel_ownerships__owner_id__owners" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ADD CONSTRAINT "fk_owners__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__region_id__regions" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__block_id__blocks" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ADD CONSTRAINT "fk_boundaries__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__region_id__regions" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ADD CONSTRAINT "fk_regions__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ADD CONSTRAINT "fk_regions__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "regions" DROP CONSTRAINT "fk_regions__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "regions" DROP CONSTRAINT "fk_regions__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__region_id__regions"
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks" DROP CONSTRAINT "fk_blocks__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries" DROP CONSTRAINT "fk_boundaries__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__boundary_id__boundaries"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__block_id__blocks"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__region_id__regions"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels" DROP CONSTRAINT "fk_parcels__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "owners" DROP CONSTRAINT "fk_owners__project_id__projects"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships" DROP CONSTRAINT "fk_parcel_ownerships__owner_id__owners"
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships" DROP CONSTRAINT "fk_parcel_ownerships__parcel_id__parcels"
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__region_id__regions" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__region_id__regions" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__block_id__blocks" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ADD CONSTRAINT "fk_regions__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__boundary_id__boundaries" FOREIGN KEY ("boundary_id") REFERENCES "boundaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships"
            ADD CONSTRAINT "fk_parcel_ownerships__parcel_id__parcels" FOREIGN KEY ("parcel_id") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "blocks"
            ADD CONSTRAINT "fk_blocks__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "boundaries"
            ADD CONSTRAINT "fk_boundaries__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "regions"
            ADD CONSTRAINT "fk_regions__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ADD CONSTRAINT "fk_owners__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "parcels"
            ADD CONSTRAINT "fk_parcels__project_id__projects" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."owners_status_enum_old" AS ENUM('active', 'inactive', 'pending')
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "status" TYPE "public"."owners_status_enum_old" USING "status"::"text"::"public"."owners_status_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."owners_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."owners_status_enum_old"
            RENAME TO "owners_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "id" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "owners"
            ALTER COLUMN "id"
            SET DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "parcel_ownerships"
            ADD CONSTRAINT "fk_parcel_ownerships__owner_id__owners" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
