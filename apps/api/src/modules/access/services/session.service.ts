import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ACCESS_CONFIG, type AccessConfig } from '../access.config';
import type { E164Phone, Principal, PrincipalMembership, RoleRef } from '../access.types';
import { parsePermission, type PermissionRef } from '../permissions';
import { execute, firstRow, returning, rows, type Queryable } from '../utils/sql';
import { generateToken, hashToken } from '../utils/token';

export interface SessionClientInfo {
  readonly userAgent: string | null;
  readonly ip: string | null;
}

export interface IssuedSession {
  /** The opaque identifier. Goes into the cookie only. */
  readonly token: string;
  readonly idleExpiresAt: Date;
  readonly absoluteExpiresAt: Date;
  /** Lifetime for the cookie: until the absolute deadline. */
  readonly cookieMaxAgeMs: number;
}

export interface AuthenticatedSession {
  readonly principal: Principal;
  /** Present when the identifier was just replaced; the response must carry the new cookie. */
  readonly rotation: { readonly token: string; readonly cookieMaxAgeMs: number } | null;
}

interface SessionRow {
  session_id: string;
  user_id: string;
  is_current: boolean;
  active_project_id: string | null;
  since_used: number;
  since_rotated: number;
  username: string;
  phone: E164Phone;
  email: string | null;
  system_role_id: string | null;
  system_role_name: string | null;
  system_role_is_system: boolean | null;
}
interface PermissionRow {
  resource: string;
  action: string;
}
interface MembershipRow extends PermissionRow {
  project_id: string;
  role_id: string;
  role_name: string;
  role_is_system: boolean;
}

/**
 * Database-backed opaque sessions: one row per user, holding only the SHA-256 of the identifier. A session is valid
 * while it is inside both its idle and absolute deadlines and its user is active and phone-verified.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(ACCESS_CONFIG) private readonly config: AccessConfig,
  ) {}

  /**
   * Creates the user's session, replacing any previous one in the same statement: the unique `user_id` makes the
   * upsert race-free, and the identifier is always new, so a pre-existing identifier can never be "adopted"
   * (session fixation). Pass the transaction's manager to make it atomic with the surrounding work.
   */
  async issue(db: Queryable, userId: string, client: SessionClientInfo): Promise<IssuedSession> {
    const { idleTtlSeconds, absoluteTtlSeconds } = this.config.session;
    await execute(db, `DELETE FROM sessions WHERE absolute_expires_at < now() OR idle_expires_at < now()`);
    const token = generateToken();
    const row = await firstRow<{ idle_expires_at: Date; absolute_expires_at: Date }>(
      db,
      `INSERT INTO sessions (user_id, token_hash, idle_expires_at, absolute_expires_at, user_agent, ip)
       VALUES ($1, $2, now() + make_interval(secs => $3), now() + make_interval(secs => $4), $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         id = gen_random_uuid(), token_hash = EXCLUDED.token_hash, previous_token_hash = NULL, active_project_id = NULL,
         rotated_at = now(), last_used_at = now(), created_at = now(),
         idle_expires_at = EXCLUDED.idle_expires_at, absolute_expires_at = EXCLUDED.absolute_expires_at,
         user_agent = EXCLUDED.user_agent, ip = EXCLUDED.ip
       RETURNING idle_expires_at, absolute_expires_at`,
      [userId, hashToken(token), idleTtlSeconds, absoluteTtlSeconds, client.userAgent?.slice(0, 500) ?? null, client.ip],
    );
    if (!row) throw new Error('Session was not stored');
    return this.toIssued(token, row.idle_expires_at, row.absolute_expires_at);
  }

  /** Resolves a cookie value to the caller, extending the idle deadline and rotating the identifier when due. */
  async authenticate(token: string): Promise<AuthenticatedSession | null> {
    const { session } = this.config;
    const tokenHash = hashToken(token);
    const row = await firstRow<SessionRow>(
      this.dataSource,
      `SELECT s.id AS session_id, s.user_id, (s.token_hash = $1) AS is_current, s.active_project_id,
              EXTRACT(EPOCH FROM (now() - s.last_used_at))::float8 AS since_used,
              EXTRACT(EPOCH FROM (now() - s.rotated_at))::float8 AS since_rotated,
              u.username, u.phone, u.email, u.system_role_id,
              sr.name AS system_role_name, sr.is_system AS system_role_is_system
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN roles sr ON sr.id = u.system_role_id AND sr.scope = 'system'
       WHERE (s.token_hash = $1
              OR (s.previous_token_hash = $1 AND s.rotated_at > now() - make_interval(secs => $2)))
         AND s.idle_expires_at > now() AND s.absolute_expires_at > now()
         AND u.is_active AND u.phone_verified_at IS NOT NULL`,
      [tokenHash, session.rotationGraceSeconds],
    );
    if (!row) return null;

    const [systemRows, membershipRows] = await Promise.all([
      row.system_role_id
        ? rows<PermissionRow>(
            this.dataSource,
            `SELECT rp.resource, rp.action FROM role_permissions rp
             JOIN roles r ON r.id = rp.role_id AND r.scope = 'system' WHERE rp.role_id = $1`,
            [row.system_role_id],
          )
        : Promise.resolve([]),
      rows<MembershipRow>(
        this.dataSource,
        `SELECT pm.project_id, r.id AS role_id, r.name AS role_name, r.is_system AS role_is_system, rp.resource, rp.action
         FROM project_members pm
         JOIN roles r ON r.id = pm.role_id AND r.scope = 'project'
         LEFT JOIN role_permissions rp ON rp.role_id = r.id AND EXISTS (
           SELECT 1 FROM permissions p WHERE p.resource = rp.resource AND p.action = rp.action AND p.project_assignable)
         WHERE pm.user_id = $1`,
        [row.user_id],
      ),
    ]);

    const principal: Principal = {
      sessionId: row.session_id,
      activeProjectId: row.active_project_id,
      user: { id: row.user_id, username: row.username, phone: row.phone, email: row.email },
      systemRole: row.system_role_id
        ? { id: row.system_role_id, name: row.system_role_name ?? '', isSystem: row.system_role_is_system ?? false }
        : null,
      systemPermissions: this.toPermissions(systemRows),
      memberships: this.toMemberships(membershipRows),
    };

    // Only the identifier that is current may rotate; a grace-period identifier just rides along.
    if (row.is_current && row.since_rotated >= session.rotationIntervalSeconds) {
      const rotated = await this.rotate(row.session_id, tokenHash);
      if (rotated) return { principal, rotation: { token: rotated.token, cookieMaxAgeMs: rotated.cookieMaxAgeMs } };
    }
    if (row.since_used >= session.touchIntervalSeconds) await this.touch(row.session_id);
    return { principal, rotation: null };
  }

  /**
   * Replaces the identifier and extends the idle deadline (never past the absolute one). With `expectedHash` the
   * update only applies if nobody rotated in between, so concurrent requests cannot fork the session.
   */
  async rotate(sessionId: string, expectedHash?: string): Promise<IssuedSession | null> {
    const token = generateToken();
    const [row] = await returning<{ idle_expires_at: Date; absolute_expires_at: Date }>(
      this.dataSource,
      `UPDATE sessions SET
         previous_token_hash = token_hash, token_hash = $2, rotated_at = now(), last_used_at = now(),
         idle_expires_at = LEAST(now() + make_interval(secs => $3), absolute_expires_at)
       WHERE id = $1 AND ($4::text IS NULL OR token_hash = $4)
         AND idle_expires_at > now() AND absolute_expires_at > now()
       RETURNING idle_expires_at, absolute_expires_at`,
      [sessionId, hashToken(token), this.config.session.idleTtlSeconds, expectedHash ?? null],
    );
    return row ? this.toIssued(token, row.idle_expires_at, row.absolute_expires_at) : null;
  }

  /** Sets the project the session works in. False when the session no longer exists. */
  async setActiveProject(db: Queryable, sessionId: string, projectId: string): Promise<boolean> {
    return (await execute(db, `UPDATE sessions SET active_project_id = $2 WHERE id = $1`, [sessionId, projectId])) > 0;
  }

  revoke(db: Queryable, sessionId: string): Promise<number> {
    return execute(db, `DELETE FROM sessions WHERE id = $1`, [sessionId]);
  }

  /** Security events (password reset, deactivation): ends the user's session, wherever it is in use. */
  revokeAllForUser(db: Queryable, userId: string): Promise<number> {
    return execute(db, `DELETE FROM sessions WHERE user_id = $1`, [userId]);
  }

  private async touch(sessionId: string): Promise<void> {
    await execute(
      this.dataSource,
      `UPDATE sessions SET last_used_at = now(), idle_expires_at = LEAST(now() + make_interval(secs => $2), absolute_expires_at)
       WHERE id = $1`,
      [sessionId, this.config.session.idleTtlSeconds],
    );
  }

  private toIssued(token: string, idleExpiresAt: Date, absoluteExpiresAt: Date): IssuedSession {
    return {
      token,
      idleExpiresAt,
      absoluteExpiresAt,
      cookieMaxAgeMs: absoluteExpiresAt.getTime() - Date.now(),
    };
  }

  private toPermissions(source: readonly PermissionRow[]): PermissionRef[] {
    const seen = new Set<string>();
    const result: PermissionRef[] = [];
    for (const row of source) {
      const permission = parsePermission(row.resource, row.action);
      const key = `${row.resource}:${row.action}`;
      if (permission && !seen.has(key)) {
        seen.add(key);
        result.push(permission);
      }
    }
    return result;
  }

  private toMemberships(source: readonly MembershipRow[]): Map<string, PrincipalMembership> {
    const grouped = new Map<string, { role: RoleRef; rows: PermissionRow[] }>();
    for (const row of source) {
      const entry = grouped.get(row.project_id) ?? {
        role: { id: row.role_id, name: row.role_name, isSystem: row.role_is_system },
        rows: [],
      };
      if (row.resource !== null && row.action !== null) entry.rows.push(row);
      grouped.set(row.project_id, entry);
    }
    const memberships = new Map<string, PrincipalMembership>();
    for (const [projectId, { role, rows: permissionRows }] of grouped) {
      memberships.set(projectId, { role, permissions: this.toPermissions(permissionRows) });
    }
    return memberships;
  }
}
