import type { ForcedSubject, MongoAbility, MongoQuery, RawRuleFrom } from '@casl/ability';
import { Action, Resource } from '../permissions';

/** CASL subject types are the resource names: `'parcel'`, `'member'`, ... */
export type SubjectName = `${Resource}`;

/** A subject is a type name (rule lookup) or an instance tagged with its type (condition evaluation). */
export type AppSubject = SubjectName | ForcedSubject<SubjectName>;

export type AppAbility = MongoAbility<[Action, AppSubject]>;

/** A rule as plain data: `{ action, subject, fields?, conditions? }`. */
export type AppRule = RawRuleFrom<[Action, SubjectName], MongoQuery>;

/** Properties of `member` records a project role may read. Contact details are never part of it. */
export const MEMBER_PUBLIC_FIELDS = ['projectId', 'userId', 'username', 'roleId', 'roleName', 'roleIsSystem', 'createdAt', 'updatedAt'] as const;

/**
 * Attribute-level limits, keyed by `resource:action`. A grant without an entry covers every field. Applied to the
 * rules built from a project role; a system-level grant has its own table below.
 */
export const PROJECT_FIELD_POLICY: Readonly<Record<string, readonly string[]>> = {
  'member:read': MEMBER_PUBLIC_FIELDS,
  'member:update': ['roleId'],
};

export const SYSTEM_FIELD_POLICY: Readonly<Record<string, readonly string[]>> = {
  'user:update': ['isActive', 'systemRoleId'],
};

/** Marker `permittedFieldsOf` returns for a rule that has no field restriction. */
export const ALL_FIELDS = '*';
