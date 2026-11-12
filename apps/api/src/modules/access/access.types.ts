import type { Request } from 'express';

/** What the auth guard attaches to the request for the rest of the pipeline. */
export interface AuthContext {
  sessionId: string;
  user: { id: string; email: string; name: string };
  globalRole: { id: string; name: string } | null;
  /** `resource:action` keys granted by the global role. They apply to every project. */
  globalPermissions: ReadonlySet<string>;
  /** projectId -> keys granted by the user's role in that project. */
  projectPermissions: ReadonlyMap<string, ReadonlySet<string>>;
  /** projectId -> role of the membership. */
  memberships: ReadonlyMap<string, { roleId: string; roleName: string }>;
}

export interface AuthedRequest extends Request {
  auth?: AuthContext;
  /** Set by the permissions guard on list routes: projects the caller may read, null = all. */
  projectScope?: string[] | null;
}
