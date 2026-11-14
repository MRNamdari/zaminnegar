import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The project a signed-in user is currently working in, stored on their (single) session. Empty after every
 * login; set with `PUT /auth/session/project`. Deleting the project clears it.
 */
export class SessionActiveProject1794614400000 implements MigrationInterface {
  name = 'SessionActiveProject1794614400000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "sessions" ADD COLUMN "active_project_id" uuid`);
    await q.query(`CREATE INDEX "ix_sessions__active_project_id" ON "sessions" ("active_project_id")`);
    await q.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions__active_project_id__projects"
      FOREIGN KEY ("active_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "sessions" DROP CONSTRAINT "fk_sessions__active_project_id__projects"`);
    await q.query(`DROP INDEX "ix_sessions__active_project_id"`);
    await q.query(`ALTER TABLE "sessions" DROP COLUMN "active_project_id"`);
  }
}
