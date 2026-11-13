import type { Request } from 'express';
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

export interface AuthenticatedRequest extends Request {
  principal?: Principal;
  /** Set by the permissions guard on list routes: projects the caller may access, `null` = all. */
  projectScope?: string[] | null;
}

/** Attributes of a resource instance that authorization rules are evaluated against. */
export type ResourceAttributes = Readonly<Record<string, unknown>>;
