import type { FastifyRequest } from 'fastify';
import type { PermissionRef } from './permissions';

/** An Iranian mobile number in E.164 form, e.g. `+989123456789`. The only phone format that is stored or compared. */
export type E164Phone = `+989${string}`;

export interface RoleRef {
  readonly id: string;
  readonly name: string;
  readonly isSystem: boolean;
}

export interface PrincipalMembership {
  readonly role: RoleRef;
  /** Only permissions that may be held at project level; anything else in the database is ignored (fail closed). */
  readonly permissions: readonly PermissionRef[];
}

/**
 * The authenticated caller, rebuilt from the database on every request so that role and membership changes
 * apply immediately. Everything the authorization layer knows about the caller is in here.
 */
export interface Principal {
  readonly sessionId: string;
  /**
   * The project the user chose to work in (`PUT /auth/session/project`); null until they choose. It only says which
   * project to act in: every action is still authorized against the user's role in that project.
   */
  readonly activeProjectId: string | null;
  readonly user: {
    readonly id: string;
    readonly username: string;
    readonly phone: E164Phone;
    readonly email: string | null;
  };
  readonly systemRole: RoleRef | null;
  /** Granted on every project. */
  readonly systemPermissions: readonly PermissionRef[];
  /** projectId -> the caller's role there. Memberships never mix: nothing here applies outside its own project. */
  readonly memberships: ReadonlyMap<string, PrincipalMembership>;
}

/**
 * Fastify types `params`, `query` and `body` as `unknown` unless told otherwise. The guards validate every value they
 * read from them, so they are typed as loosely as Express typed them.
 */
export interface AuthenticatedRequest
  extends FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, unknown>;
    Body: unknown;
  }> {
  principal?: Principal;
  /** Set by the permissions guard on list routes: projects the caller may access, `null` = all. */
  projectScope?: string[] | null;
}

/** Attributes of a resource instance that authorization rules are evaluated against. */
export type ResourceAttributes = Readonly<Record<string, unknown>>;
