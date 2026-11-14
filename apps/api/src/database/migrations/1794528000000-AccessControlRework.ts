import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reworks authentication and authorization (the `access` module):
 *
 *   - Username + password + verified phone replace phone-OTP login. Sessions become cookie sessions, one per user.
 *   - `permissions` holds the global permission definitions; `role_permissions` references it.
 *   - Roles are system-level (predefined, `users.system_role_id`) or project-level. Custom project roles now belong
 *     to exactly one project (`roles.project_id`). Triggers enforce the invariants that foreign keys cannot:
 *       * a membership's role is a project role that is predefined or belongs to that very project,
 *       * a user's system role has scope `system`,
 *       * a project role never holds a system-only permission,
 *       * a role's scope and project never change.
 *
 * Existing data is converted, not dropped:
 *   - users keep their rows; a username is derived (email local part, else `user_<hash>`); everyone with a phone is
 *     treated as phone-verified (they signed in with it); legacy scrypt hashes cannot be verified by Argon2id, so
 *     password hashes are cleared and users set a new password through "forgot password".
 *   - `name` is kept, nullable and unused. `email` is no longer unique.
 *   - custom project roles are copied into each project that uses them; custom global roles become predefined.
 *   - `admin` is renamed `superadmin`; the seeded roles get the canonical permission sets below; `member:create`
 *     becomes `member:invite`.
 *   - sessions and OTP challenges are short-lived and are recreated empty: everyone signs in again.
 */
export class AccessControlRework1794528000000 implements MigrationInterface {
  name = 'AccessControlRework1794528000000';

  async up(q: QueryRunner): Promise<void> {
    // ---- 1. short-lived tables are rebuilt in step 9 ----------------------------------------------------------
    await q.query(`DROP TABLE "sessions"`);
    await q.query(`DROP TABLE "otp_challenges"`);

    // ---- 2. roles ---------------------------------------------------------------------------------------------
    await q.query(`ALTER TYPE "public"."role_scope" RENAME VALUE 'global' TO 'system'`);
    await q.query(`ALTER TABLE "roles" DROP CONSTRAINT "uq_roles__name"`);
    await q.query(`ALTER TABLE "roles" ADD COLUMN "project_id" uuid`);
    await q.query(`UPDATE "roles" SET "name" = 'superadmin' WHERE "name" = 'admin' AND "scope" = 'system' AND "is_system"`);

    // Custom project roles used to be shared across projects: give every project that uses one its own copy.
    await q.query(`
      INSERT INTO "roles" ("name", "description", "scope", "is_system", "project_id")
      SELECT DISTINCT r."name", r."description", 'project'::"public"."role_scope", false, pm."project_id"
      FROM "roles" r JOIN "project_members" pm ON pm."role_id" = r."id"
      WHERE r."scope" = 'project' AND NOT r."is_system" AND r."project_id" IS NULL`);
    await q.query(`
      INSERT INTO "role_permissions" ("role_id", "resource", "action")
      SELECT c."id", rp."resource", rp."action"
      FROM "roles" c
      JOIN "roles" r ON r."name" = c."name" AND r."project_id" IS NULL AND r."scope" = 'project' AND NOT r."is_system"
      JOIN "role_permissions" rp ON rp."role_id" = r."id"
      WHERE c."project_id" IS NOT NULL`);
    await q.query(`
      UPDATE "project_members" pm SET "role_id" = c."id"
      FROM "roles" r, "roles" c
      WHERE pm."role_id" = r."id" AND r."project_id" IS NULL AND r."scope" = 'project' AND NOT r."is_system"
        AND c."project_id" = pm."project_id" AND c."name" = r."name"`);
    await q.query(`DELETE FROM "roles" WHERE "scope" = 'project' AND NOT "is_system" AND "project_id" IS NULL`);
    // Custom global roles cannot exist any more; keeping them as predefined roles preserves what users can do today.
    await q.query(`UPDATE "roles" SET "is_system" = true WHERE "scope" = 'system' AND NOT "is_system"`);

    await q.query(`
      ALTER TABLE "roles" ADD CONSTRAINT "fk_roles__project_id__projects"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await q.query(`
      ALTER TABLE "roles" ADD CONSTRAINT "ck_roles__custom_roles_are_project_scoped"
      CHECK ("project_id" IS NULL OR ("scope" = 'project' AND NOT "is_system"))`);
    await q.query(`CREATE UNIQUE INDEX "uq_roles__name_predefined" ON "roles" ("name") WHERE "project_id" IS NULL`);
    await q.query(`CREATE UNIQUE INDEX "uq_roles__project_id_name" ON "roles" ("project_id", "name") WHERE "project_id" IS NOT NULL`);
    await q.query(`CREATE INDEX "ix_roles__project_id" ON "roles" ("project_id")`);

    // ---- 3. permission definitions ----------------------------------------------------------------------------
    await q.query(`
      CREATE TABLE "permissions" (
        "resource" character varying(50) NOT NULL,
        "action" character varying(50) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "project_assignable" boolean NOT NULL DEFAULT false,
        CONSTRAINT "pk_permissions" PRIMARY KEY ("resource", "action")
      )`);

    const DATA = ['boundary', 'region', 'block', 'parcel', 'owner', 'ownership'];
    const CRUD = ['create', 'read', 'update', 'delete'];
    type Def = { resource: string; action: string; description: string; projectAssignable: boolean };
    const defs: Def[] = [
      { resource: 'project', action: 'create', description: 'Create projects (the creator becomes the owner)', projectAssignable: false },
      { resource: 'project', action: 'read', description: 'View a project', projectAssignable: true },
      { resource: 'project', action: 'update', description: 'Edit a project', projectAssignable: true },
      { resource: 'project', action: 'delete', description: 'Delete a project', projectAssignable: true },
      { resource: 'project', action: 'manage', description: 'Every action on a project', projectAssignable: true },
      ...DATA.flatMap((resource) =>
        CRUD.map((action) => ({ resource, action, description: `${action} ${resource} records`, projectAssignable: true })),
      ),
      { resource: 'member', action: 'read', description: 'List the members of a project', projectAssignable: true },
      { resource: 'member', action: 'invite', description: 'Add users to a project', projectAssignable: true },
      { resource: 'member', action: 'update', description: 'Change the role of a member', projectAssignable: true },
      { resource: 'member', action: 'delete', description: 'Remove members from a project', projectAssignable: true },
      ...['create', 'read', 'update', 'delete', 'manage'].map((action) => ({
        resource: 'role',
        action,
        description: `${action === 'manage' ? 'Every action on' : action} custom roles of a project`,
        projectAssignable: true,
      })),
      { resource: 'user', action: 'read', description: 'View any user account', projectAssignable: false },
      { resource: 'user', action: 'update', description: 'Activate/deactivate accounts and set system roles', projectAssignable: false },
    ];
    for (const d of defs) {
      await q.query(
        `INSERT INTO "permissions" ("resource", "action", "description", "project_assignable") VALUES ($1, $2, $3, $4)`,
        [d.resource, d.action, d.description, d.projectAssignable],
      );
    }

    // ---- 4. role_permissions -> permissions -------------------------------------------------------------------
    await q.query(`UPDATE "role_permissions" SET "action" = 'invite' WHERE "resource" = 'member' AND "action" = 'create'`);
    await q.query(`
      DELETE FROM "role_permissions" rp WHERE NOT EXISTS (
        SELECT 1 FROM "permissions" p WHERE p."resource" = rp."resource" AND p."action" = rp."action")`);
    await q.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions__resource_action__permissions"
      FOREIGN KEY ("resource", "action") REFERENCES "permissions"("resource", "action") ON DELETE CASCADE ON UPDATE NO ACTION`);

    // ---- 5. predefined roles ----------------------------------------------------------------------------------
    const pick = (pred: (d: Def) => boolean) => defs.filter(pred).map((d) => [d.resource, d.action] as const);
    const crudOf = (resources: string[], actions: string[] = CRUD) =>
      resources.flatMap((resource) => actions.map((action) => [resource, action] as const));
    const predefined: Array<{ name: string; description: string; scope: 'system' | 'project'; permissions: ReadonlyArray<readonly [string, string]> }> = [
      { name: 'superadmin', description: 'Every permission on every project, and the only role that administers users', scope: 'system', permissions: pick(() => true) },
      { name: 'system_auditor', description: 'Read-only access to every project and user', scope: 'system', permissions: pick((d) => d.action === 'read') },
      { name: 'user', description: 'Default role of every account: may create projects', scope: 'system', permissions: [['project', 'create']] },
      { name: 'owner', description: 'Owns one project: everything, including its members, roles and deletion', scope: 'project', permissions: pick((d) => d.projectAssignable) },
      {
        name: 'manager',
        description: 'Administers one project: its data, members and custom roles',
        scope: 'project',
        permissions: [...crudOf(['project'], ['read', 'update']), ...crudOf(DATA), ...crudOf(['role']), ['member', 'read'], ['member', 'invite'], ['member', 'update'], ['member', 'delete']],
      },
      {
        name: 'editor',
        description: 'Creates and edits the data of one project',
        scope: 'project',
        permissions: [['project', 'read'], ['member', 'read'], ['role', 'read'], ...crudOf(DATA, ['create', 'read', 'update']), ...crudOf(['boundary', 'ownership'], ['delete'])],
      },
      { name: 'viewer', description: 'Read-only access to one project', scope: 'project', permissions: crudOf(['project', ...DATA, 'member', 'role'], ['read']) },
    ];
    for (const role of predefined) {
      const rows = (await q.query(
        `INSERT INTO "roles" ("name", "description", "scope", "is_system") VALUES ($1, $2, $3, true)
         ON CONFLICT ("name") WHERE "project_id" IS NULL
         DO UPDATE SET "description" = EXCLUDED."description", "is_system" = true, "updated_at" = now()
         RETURNING "id"`,
        [role.name, role.description, role.scope],
      )) as Array<{ id: string }>;
      const id = rows[0].id;
      await q.query(`DELETE FROM "role_permissions" WHERE "role_id" = $1`, [id]);
      await q.query(
        `INSERT INTO "role_permissions" ("role_id", "resource", "action")
         SELECT $1, p.resource, p.action FROM unnest($2::text[], $3::text[]) AS p(resource, action)`,
        [id, role.permissions.map(([r]) => r), role.permissions.map(([, a]) => a)],
      );
    }

    // ---- 6. users ---------------------------------------------------------------------------------------------
    await q.query(`ALTER TABLE "users" RENAME COLUMN "global_role_id" TO "system_role_id"`);
    await q.query(`ALTER TABLE "users" RENAME CONSTRAINT "fk_users__global_role_id__roles" TO "fk_users__system_role_id__roles"`);
    await q.query(`ALTER INDEX "ix_users__global_role_id" RENAME TO "ix_users__system_role_id"`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "username" character varying(32)`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "phone_verified_at" TIMESTAMP WITH TIME ZONE`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "failed_login_count" integer NOT NULL DEFAULT 0`);
    await q.query(`ALTER TABLE "users" ADD COLUMN "locked_until" TIMESTAMP WITH TIME ZONE`);
    await q.query(`
      WITH cleaned AS (
        SELECT "id", regexp_replace(lower(split_part("email", '@', 1)), '[^a-z0-9_]', '', 'g') AS local FROM "users"
      ), base AS (
        SELECT "id", CASE
            WHEN length(local) >= 3 AND local !~ '^[0-9]+$' THEN left(local, 24)
            ELSE 'user_' || substr(md5("id"::text), 1, 10)
          END AS base
        FROM cleaned
      ), ranked AS (
        SELECT "id", base, row_number() OVER (PARTITION BY base ORDER BY "id") AS rn FROM base
      )
      UPDATE "users" u SET "username" = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '_' || substr(md5(u."id"::text), 1, 6) END
      FROM ranked r WHERE r."id" = u."id"`);
    await q.query(`UPDATE "users" SET "phone_verified_at" = "created_at" WHERE "phone" IS NOT NULL`);
    await q.query(`UPDATE "users" SET "password_hash" = NULL WHERE "password_hash" LIKE 'scrypt%'`);
    await q.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
    await q.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT "uq_users__email"`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT "ck_users__has_identifier"`);
    await q.query(`ALTER TABLE "users" ADD CONSTRAINT "uq_users__username" UNIQUE ("username")`);
    await q.query(`ALTER TABLE "users" ADD CONSTRAINT "ck_users__username_format" CHECK ("username" ~ '^[a-z0-9_]{3,32}$')`);
    await q.query(`ALTER TABLE "users" ADD CONSTRAINT "ck_users__phone_required_when_verified" CHECK ("phone_verified_at" IS NULL OR "phone" IS NOT NULL)`);

    // ---- 7. project_members: the role FK is deferred so a project delete can drop members and custom roles together
    await q.query(`ALTER TABLE "project_members" DROP CONSTRAINT "fk_project_members__role_id__roles"`);
    await q.query(`
      ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members__role_id__roles"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`);

    // ---- 8. sessions ------------------------------------------------------------------------------------------
    await q.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "previous_token_hash" character varying(64),
        "rotated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "idle_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "absolute_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "user_agent" character varying(500),
        "ip" character varying(45),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "uq_sessions__user_id" UNIQUE ("user_id"),
        CONSTRAINT "uq_sessions__token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "pk_sessions" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "ix_sessions__previous_token_hash" ON "sessions" ("previous_token_hash")`);
    await q.query(`CREATE INDEX "ix_sessions__idle_expires_at" ON "sessions" ("idle_expires_at")`);
    await q.query(`CREATE INDEX "ix_sessions__absolute_expires_at" ON "sessions" ("absolute_expires_at")`);
    await q.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions__user_id__users"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    // ---- 9. OTP challenges ------------------------------------------------------------------------------------
    await q.query(`CREATE TYPE "public"."otp_purpose" AS ENUM('registration', 'password_reset')`);
    await q.query(`
      CREATE TABLE "otp_challenges" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "subject_key" character varying(80) NOT NULL,
        "purpose" "public"."otp_purpose" NOT NULL,
        "user_id" uuid,
        "code_hash" character varying(64) NOT NULL,
        "attempts" integer NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "consumed_at" TIMESTAMP WITH TIME ZONE,
        "ip" character varying(45),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_otp_challenges" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "ix_otp_challenges__subject_key_created_at" ON "otp_challenges" ("subject_key", "created_at")`);
    await q.query(`CREATE INDEX "ix_otp_challenges__ip_created_at" ON "otp_challenges" ("ip", "created_at")`);
    await q.query(`CREATE INDEX "ix_otp_challenges__created_at" ON "otp_challenges" ("created_at")`);
    await q.query(`
      ALTER TABLE "otp_challenges" ADD CONSTRAINT "fk_otp_challenges__user_id__users"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

    // ---- 10. invariants that foreign keys cannot express (created last so the conversions above are not blocked) --
    await q.query(`
      CREATE OR REPLACE FUNCTION project_members_check_role() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE v_scope role_scope; v_project uuid;
      BEGIN
        SELECT scope, project_id INTO v_scope, v_project FROM roles WHERE id = NEW.role_id;
        IF v_scope IS DISTINCT FROM 'project' OR (v_project IS NOT NULL AND v_project <> NEW.project_id) THEN
          RAISE EXCEPTION 'role % cannot be assigned in project %', NEW.role_id, NEW.project_id
            USING ERRCODE = 'check_violation', DETAIL = 'ROLE_NOT_ASSIGNABLE';
        END IF;
        RETURN NEW;
      END $$`);
    await q.query(`
      CREATE TRIGGER trg_project_members_check_role BEFORE INSERT OR UPDATE OF role_id, project_id ON project_members
      FOR EACH ROW EXECUTE FUNCTION project_members_check_role()`);

    await q.query(`
      CREATE OR REPLACE FUNCTION users_check_system_role() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE v_scope role_scope;
      BEGIN
        IF NEW.system_role_id IS NOT NULL THEN
          SELECT scope INTO v_scope FROM roles WHERE id = NEW.system_role_id;
          IF v_scope IS DISTINCT FROM 'system' THEN
            RAISE EXCEPTION 'role % is not a system role', NEW.system_role_id
              USING ERRCODE = 'check_violation', DETAIL = 'ROLE_NOT_ASSIGNABLE';
          END IF;
        END IF;
        RETURN NEW;
      END $$`);
    await q.query(`
      CREATE TRIGGER trg_users_check_system_role BEFORE INSERT OR UPDATE OF system_role_id ON users
      FOR EACH ROW EXECUTE FUNCTION users_check_system_role()`);

    await q.query(`
      CREATE OR REPLACE FUNCTION role_permissions_check_grantable() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE v_scope role_scope; v_assignable boolean;
      BEGIN
        SELECT scope INTO v_scope FROM roles WHERE id = NEW.role_id;
        SELECT project_assignable INTO v_assignable FROM permissions WHERE resource = NEW.resource AND action = NEW.action;
        IF v_scope = 'project' AND v_assignable IS DISTINCT FROM true THEN
          RAISE EXCEPTION 'permission %:% cannot be held by a project role', NEW.resource, NEW.action
            USING ERRCODE = 'check_violation', DETAIL = 'PERMISSION_NOT_GRANTABLE';
        END IF;
        RETURN NEW;
      END $$`);
    await q.query(`
      CREATE TRIGGER trg_role_permissions_check_grantable BEFORE INSERT OR UPDATE ON role_permissions
      FOR EACH ROW EXECUTE FUNCTION role_permissions_check_grantable()`);

    await q.query(`
      CREATE OR REPLACE FUNCTION roles_forbid_rescope() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.scope IS DISTINCT FROM OLD.scope OR NEW.project_id IS DISTINCT FROM OLD.project_id OR NEW.is_system IS DISTINCT FROM OLD.is_system THEN
          RAISE EXCEPTION 'the scope, project and predefined flag of a role cannot change'
            USING ERRCODE = 'check_violation', DETAIL = 'ROLE_SCOPE_IMMUTABLE';
        END IF;
        RETURN NEW;
      END $$`);
    await q.query(`
      CREATE TRIGGER trg_roles_forbid_rescope BEFORE UPDATE OF scope, project_id, is_system ON roles
      FOR EACH ROW EXECUTE FUNCTION roles_forbid_rescope()`);
  }

  /**
   * Restores the previous schema shape. Data the old schema cannot represent is discarded: custom project roles and
   * the memberships that use them, usernames, sessions and OTP challenges. Duplicate emails are cleared.
   */
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TRIGGER trg_roles_forbid_rescope ON roles`);
    await q.query(`DROP TRIGGER trg_role_permissions_check_grantable ON role_permissions`);
    await q.query(`DROP TRIGGER trg_users_check_system_role ON users`);
    await q.query(`DROP TRIGGER trg_project_members_check_role ON project_members`);
    await q.query(`DROP FUNCTION roles_forbid_rescope()`);
    await q.query(`DROP FUNCTION role_permissions_check_grantable()`);
    await q.query(`DROP FUNCTION users_check_system_role()`);
    await q.query(`DROP FUNCTION project_members_check_role()`);

    await q.query(`DROP TABLE "otp_challenges"`);
    await q.query(`DROP TYPE "public"."otp_purpose"`);
    await q.query(`DROP TABLE "sessions"`);
    await q.query(`
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
      )`);
    await q.query(`CREATE INDEX "ix_sessions__user_id" ON "sessions" ("user_id")`);
    await q.query(`CREATE INDEX "ix_sessions__expires_at" ON "sessions" ("expires_at")`);
    await q.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions__user_id__users"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await q.query(`
      CREATE TABLE otp_challenges (
        id          uuid         NOT NULL DEFAULT gen_random_uuid(),
        phone       varchar(13)  NOT NULL,
        code_hash   varchar(64)  NOT NULL,
        attempts    integer      NOT NULL DEFAULT 0,
        expires_at  timestamptz  NOT NULL,
        consumed_at timestamptz,
        ip          varchar(45),
        created_at  timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT pk_otp_challenges PRIMARY KEY (id),
        CONSTRAINT ck_otp_challenges__phone_format CHECK (phone ~ '^\\+989[0-9]{9}$')
      )`);
    await q.query(`CREATE INDEX ix_otp_challenges__phone_created_at ON otp_challenges (phone, created_at)`);
    await q.query(`CREATE INDEX ix_otp_challenges__ip_created_at ON otp_challenges (ip, created_at)`);
    await q.query(`CREATE INDEX ix_otp_challenges__created_at ON otp_challenges (created_at)`);

    // memberships on custom project roles cannot survive
    await q.query(`DELETE FROM "project_members" WHERE "role_id" IN (SELECT "id" FROM "roles" WHERE "project_id" IS NOT NULL)`);
    await q.query(`ALTER TABLE "project_members" DROP CONSTRAINT "fk_project_members__role_id__roles"`);
    await q.query(`
      ALTER TABLE "project_members" ADD CONSTRAINT "fk_project_members__role_id__roles"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);

    await q.query(`UPDATE "users" SET "name" = "username" WHERE "name" IS NULL`);
    // email stops being unique in this migration: keep the first of any duplicates, then guarantee an identifier
    await q.query(`
      UPDATE "users" u SET "email" = NULL
      FROM (SELECT "id", row_number() OVER (PARTITION BY "email" ORDER BY "created_at", "id") AS rn FROM "users" WHERE "email" IS NOT NULL) d
      WHERE d."id" = u."id" AND d.rn > 1`);
    await q.query(`UPDATE "users" SET "email" = "username" || '@invalid.example' WHERE "email" IS NULL AND "phone" IS NULL`);
    await q.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);
    await q.query(`ALTER TABLE "users" ADD CONSTRAINT "uq_users__email" UNIQUE ("email")`);
    await q.query(`ALTER TABLE "users" ADD CONSTRAINT "ck_users__has_identifier" CHECK (phone IS NOT NULL OR email IS NOT NULL)`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT "ck_users__phone_required_when_verified"`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT "ck_users__username_format"`);
    await q.query(`ALTER TABLE "users" DROP CONSTRAINT "uq_users__username"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "locked_until"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "failed_login_count"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "phone_verified_at"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await q.query(`ALTER INDEX "ix_users__system_role_id" RENAME TO "ix_users__global_role_id"`);
    await q.query(`ALTER TABLE "users" RENAME CONSTRAINT "fk_users__system_role_id__roles" TO "fk_users__global_role_id__roles"`);
    await q.query(`ALTER TABLE "users" RENAME COLUMN "system_role_id" TO "global_role_id"`);

    await q.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_role_permissions__resource_action__permissions"`);
    await q.query(`UPDATE "role_permissions" SET "action" = 'create' WHERE "resource" = 'member' AND "action" = 'invite'`);
    await q.query(`DROP TABLE "permissions"`);

    await q.query(`DELETE FROM "roles" WHERE "project_id" IS NOT NULL`);
    await q.query(`DELETE FROM "roles" WHERE "name" IN ('owner', 'system_auditor', 'user') AND "is_system"`);
    await q.query(`UPDATE "roles" SET "name" = 'admin' WHERE "name" = 'superadmin'`);
    await q.query(`DROP INDEX "ix_roles__project_id"`);
    await q.query(`DROP INDEX "uq_roles__project_id_name"`);
    await q.query(`DROP INDEX "uq_roles__name_predefined"`);
    await q.query(`ALTER TABLE "roles" DROP CONSTRAINT "ck_roles__custom_roles_are_project_scoped"`);
    await q.query(`ALTER TABLE "roles" DROP CONSTRAINT "fk_roles__project_id__projects"`);
    await q.query(`ALTER TABLE "roles" DROP COLUMN "project_id"`);
    await q.query(`ALTER TABLE "roles" ADD CONSTRAINT "uq_roles__name" UNIQUE ("name")`);
    await q.query(`ALTER TYPE "public"."role_scope" RENAME VALUE 'system' TO 'global'`);
  }
}
