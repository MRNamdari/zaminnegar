import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Authentication + RBAC tables and the seeded system roles.
 *
 *   roles (scope global|project) 1-* role_permissions (resource, action)
 *   users.global_role_id  -> a global role (e.g. admin): applies to every project
 *   project_members       -> (user, project, role): applies to that project only
 *   sessions              -> opaque bearer sessions (SHA-256 of the token)
 *
 * The first administrator is created at application start from ADMIN_EMAIL / ADMIN_PASSWORD (see AuthService),
 * so no credential is stored in a migration.
 */
export class AccessControl1794300000001 implements MigrationInterface {
  name = 'AccessControl1794300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."role_scope" AS ENUM('global', 'project')`);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "scope" "public"."role_scope" NOT NULL,
        "is_system" boolean NOT NULL DEFAULT false,
        CONSTRAINT "uq_roles__name" UNIQUE ("name"),
        CONSTRAINT "pk_roles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "resource" character varying(50) NOT NULL,
        "action" character varying(50) NOT NULL,
        CONSTRAINT "pk_role_permissions" PRIMARY KEY ("role_id", "resource", "action")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(320) NOT NULL,
        "name" character varying(200) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "global_role_id" uuid,
        CONSTRAINT "uq_users__email" UNIQUE ("email"),
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "ix_users__global_role_id" ON "users" ("global_role_id")`);
    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "project_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "pk_project_members" PRIMARY KEY ("user_id", "project_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "ix_project_members__project_id" ON "project_members" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "ix_project_members__role_id" ON "project_members" ("role_id")`);
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_agent" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "uq_sessions__token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "pk_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "ix_sessions__user_id" ON "sessions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "ix_sessions__expires_at" ON "sessions" ("expires_at")`);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions__role_id__roles"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "fk_users__global_role_id__roles"
      FOREIGN KEY ("global_role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members__user_id__users"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members__project_id__projects"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members__role_id__roles"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions__user_id__users"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ---- system roles ----------------------------------------------------------------------------------------
    const ACTIONS = ['create', 'read', 'update', 'delete'];
    const DATA = ['boundary', 'region', 'block', 'parcel', 'owner', 'ownership'];
    const ALL = ['project', ...DATA, 'member', 'user', 'role'];
    const crud = (resources: string[], actions = ACTIONS) => resources.flatMap((r) => actions.map((a) => [r, a]));

    const roles: Array<{ name: string; description: string; scope: 'global' | 'project'; permissions: string[][] }> = [
      {
        name: 'admin',
        description: 'Full access to every project, and the only role that can administer users and roles',
        scope: 'global',
        permissions: crud(ALL),
      },
      {
        name: 'manager',
        description: 'Manages one project: its data and its members',
        scope: 'project',
        permissions: [...crud(['project'], ['read', 'update']), ...crud([...DATA, 'member'])],
      },
      {
        name: 'editor',
        description: 'Creates and edits the data of one project',
        scope: 'project',
        permissions: [
          ...crud(['project', 'member'], ['read']),
          ...crud(DATA, ['create', 'read', 'update']),
          ...crud(['boundary', 'ownership'], ['delete']),
        ],
      },
      {
        name: 'viewer',
        description: 'Read-only access to one project',
        scope: 'project',
        permissions: crud(['project', ...DATA, 'member'], ['read']),
      },
    ];

    for (const role of roles) {
      const [{ id }] = (await queryRunner.query(
        `INSERT INTO "roles" ("name", "description", "scope", "is_system") VALUES ($1, $2, $3, true) RETURNING "id"`,
        [role.name, role.description, role.scope],
      )) as Array<{ id: string }>;
      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "resource", "action")
         SELECT $1, p.resource, p.action FROM unnest($2::text[], $3::text[]) AS p(resource, action)`,
        [id, role.permissions.map(([r]) => r), role.permissions.map(([, a]) => a)],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."role_scope"`);
  }
}
