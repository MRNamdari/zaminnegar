import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';
import { AuthContext } from '../access.types';

const TOUCH_AFTER_MS = 60_000;

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

interface SessionRow {
  session_id: string;
  last_used_at: Date;
  user_id: string;
  email: string;
  name: string;
  global_role_id: string | null;
  global_role_name: string | null;
}

@Injectable()
export class SessionService {
  private readonly ttlMs: number;

  constructor(
    private readonly dataSource: DataSource,
    config: ConfigService,
  ) {
    this.ttlMs = Number(config.get('SESSION_TTL_HOURS') ?? 72) * 3_600_000;
  }

  /** Opens a session and returns the token, which is shown to the client exactly once. */
  async create(userId: string, userAgent: string | null): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.ttlMs);
    await this.dataSource.query(`DELETE FROM sessions WHERE user_id = $1 AND expires_at < now()`, [userId]);
    await this.dataSource.query(
      `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent) VALUES ($1, $2, $3, $4)`,
      [userId, sha256(token), expiresAt, userAgent?.slice(0, 500) ?? null],
    );
    return { token, expiresAt };
  }

  revoke(sessionId: string): Promise<unknown> {
    return this.dataSource.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
  }

  revokeAllOf(userId: string): Promise<unknown> {
    return this.dataSource.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  }

  /** Resolves a bearer token to the caller and everything the caller may do; null when invalid/expired/inactive. */
  async authenticate(token: string): Promise<AuthContext | null> {
    const rows: SessionRow[] = await this.dataSource.query(
      `SELECT s.id AS session_id, s.last_used_at, u.id AS user_id, u.email, u.name,
              u.global_role_id, gr.name AS global_role_name
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN roles gr ON gr.id = u.global_role_id
        WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active`,
      [sha256(token)],
    );
    const row = rows[0];
    if (!row) return null;

    if (Date.now() - new Date(row.last_used_at).getTime() > TOUCH_AFTER_MS) {
      await this.dataSource.query(`UPDATE sessions SET last_used_at = now() WHERE id = $1`, [row.session_id]);
    }

    const globalPermissions = new Set<string>();
    if (row.global_role_id) {
      const rows: Array<{ resource: string; action: string }> = await this.dataSource.query(
        `SELECT resource, action FROM role_permissions WHERE role_id = $1`,
        [row.global_role_id],
      );
      for (const { resource, action } of rows) globalPermissions.add(`${resource}:${action}`);
    }

    const projectPermissions = new Map<string, Set<string>>();
    const memberships = new Map<string, { roleId: string; roleName: string }>();
    const memberRows: Array<{ project_id: string; role_id: string; role_name: string; resource: string | null; action: string | null }> =
      await this.dataSource.query(
        `SELECT pm.project_id, pm.role_id, r.name AS role_name, rp.resource, rp.action
           FROM project_members pm
           JOIN roles r ON r.id = pm.role_id
           LEFT JOIN role_permissions rp ON rp.role_id = pm.role_id
          WHERE pm.user_id = $1`,
        [row.user_id],
      );
    for (const m of memberRows) {
      memberships.set(m.project_id, { roleId: m.role_id, roleName: m.role_name });
      const set = projectPermissions.get(m.project_id) ?? new Set<string>();
      if (m.resource && m.action) set.add(`${m.resource}:${m.action}`);
      projectPermissions.set(m.project_id, set);
    }

    return {
      sessionId: row.session_id,
      user: { id: row.user_id, email: row.email, name: row.name },
      globalRole: row.global_role_id ? { id: row.global_role_id, name: row.global_role_name as string } : null,
      globalPermissions,
      projectPermissions,
      memberships,
    };
  }
}
