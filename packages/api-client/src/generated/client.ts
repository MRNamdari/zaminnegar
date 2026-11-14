// @ts-nocheck
import type * as __TypedOpenapi from "./client.types.js";

import { z } from "zod";

// <Schemas>
export type ErrorResponseDto = __TypedOpenapi.Schemas.ErrorResponseDto;
export const ErrorResponseDto = z.strictObject({
  code: z.string().describe("Stable, machine-readable code"),
  message: z.string(),
  retryAfterSeconds: z
    .number()
    .describe("Present on rate-limit errors (429): seconds until a retry can succeed")
    .optional(),
});

export type ValidationErrorResponseDto = __TypedOpenapi.Schemas.ValidationErrorResponseDto;
export const ValidationErrorResponseDto = z.strictObject({
  statusCode: z.number(),
  message: z
    .union([z.string(), z.array(z.string())])
    .refine(
      (data) =>
        [z.string().safeParse(data).success, z.array(z.string()).safeParse(data).success].filter(Boolean).length === 1,
      { message: "oneOf" },
    )
    .describe("One message, or one per invalid property"),
  error: z.string(),
});

export type RegisterUserDto = __TypedOpenapi.Schemas.RegisterUserDto;
export const RegisterUserDto = z.strictObject({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(new RegExp("^(?!\\d+$)[a-z0-9_]{3,32}$"))
    .describe('Lower case letters, digits and "_"; not only digits. Case-insensitive.'),
  password: z.string().min(10).max(128),
  phone: z
    .string()
    .regex(new RegExp("^(?:\\+98|0098|98|0)?9\\d{9}$"))
    .describe("Iranian mobile number in any common format; stored and returned as E.164 (`+989123456789`)"),
  email: z.email().max(320).describe("Never verified and never used to sign in").optional(),
});

export type OtpDispatchResponseDto = __TypedOpenapi.Schemas.OtpDispatchResponseDto;
export const OtpDispatchResponseDto = z.strictObject({
  expiresAt: z.iso
    .datetime()
    .transform((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
      return d;
    })
    .describe("The code stops working at this time"),
  resendAvailableAt: z.iso
    .datetime()
    .transform((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
      return d;
    })
    .describe("A new code can be requested from this time"),
});

export type VerifyRegistrationDto = __TypedOpenapi.Schemas.VerifyRegistrationDto;
export const VerifyRegistrationDto = z.strictObject({
  phone: z
    .string()
    .regex(new RegExp("^(?:\\+98|0098|98|0)?9\\d{9}$"))
    .describe("Iranian mobile number in any common format; stored and returned as E.164 (`+989123456789`)"),
  code: z.string().regex(new RegExp("^[0-9]{6}$")),
});

export type LoginDto = __TypedOpenapi.Schemas.LoginDto;
export const LoginDto = z.strictObject({
  username: z.string().max(64).describe("Case-insensitive"),
  password: z.string().max(128),
});

export type UserSummaryDto = __TypedOpenapi.Schemas.UserSummaryDto;
export const UserSummaryDto = z.strictObject({
  id: z.uuid(),
  username: z.string(),
  phone: z.string(),
  email: z.email().nullable(),
});

export type SessionResponseDto = __TypedOpenapi.Schemas.SessionResponseDto;
export const SessionResponseDto = z.strictObject({
  user: UserSummaryDto,
  idleExpiresAt: z.iso
    .datetime()
    .transform((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
      return d;
    })
    .describe("The session ends here unless it is used before"),
  absoluteExpiresAt: z.iso
    .datetime()
    .transform((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
      return d;
    })
    .describe("The session ends here no matter how active it is"),
});

export type RoleSummaryDto = __TypedOpenapi.Schemas.RoleSummaryDto;
export const RoleSummaryDto = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  isSystem: z.boolean().describe("Predefined (seeded) role"),
});

export type Resource = __TypedOpenapi.Schemas.Resource;
export const Resource = z.enum([
  "project",
  "boundary",
  "region",
  "block",
  "parcel",
  "owner",
  "ownership",
  "member",
  "role",
  "user",
]);

export type Action = __TypedOpenapi.Schemas.Action;
export const Action = z.enum(["create", "read", "update", "delete", "invite", "manage"]);

export type PermissionDto = __TypedOpenapi.Schemas.PermissionDto;
export const PermissionDto = z.strictObject({ resource: Resource, action: Action });

export type CurrentMembershipDto = __TypedOpenapi.Schemas.CurrentMembershipDto;
export const CurrentMembershipDto = z.strictObject({
  projectId: z.uuid(),
  role: RoleSummaryDto,
  permissions: z.array(PermissionDto),
});

export type CurrentUserResponseDto = __TypedOpenapi.Schemas.CurrentUserResponseDto;
export const CurrentUserResponseDto = z.strictObject({
  id: z.uuid(),
  username: z.string(),
  phone: z.string(),
  email: z.email().nullable(),
  systemRole: RoleSummaryDto.and(z.record(z.string(), z.unknown()).nullable()).nullable(),
  systemPermissions: z.array(PermissionDto).describe("Granted on every project"),
  memberships: z.array(CurrentMembershipDto),
});

export type ForgotPasswordDto = __TypedOpenapi.Schemas.ForgotPasswordDto;
export const ForgotPasswordDto = z.strictObject({
  identifier: z.string().describe("Username, or phone number in any common Iranian format (normalised to E.164)"),
});

export type ResetPasswordDto = __TypedOpenapi.Schemas.ResetPasswordDto;
export const ResetPasswordDto = z.strictObject({
  identifier: z.string().describe("The same username or phone number that requested the code"),
  code: z.string().regex(new RegExp("^[0-9]{6}$")),
  newPassword: z.string().min(10).max(128),
});

export type PaginatedResponseDto = __TypedOpenapi.Schemas.PaginatedResponseDto;
export const PaginatedResponseDto = z.strictObject({
  items: z.array(z.record(z.string(), z.unknown())),
  total: z.number().describe("Total number of matches across all pages"),
  page: z.number(),
  limit: z.number(),
});

export type UserResponseDto = __TypedOpenapi.Schemas.UserResponseDto;
export const UserResponseDto = z.strictObject({
  id: z.uuid(),
  username: z.string(),
  phone: z.string().nullable(),
  phoneVerifiedAt: z.iso
    .datetime()
    .transform((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
      return d;
    })
    .describe("Null until registration is finished")
    .nullable()
    .describe("Null until registration is finished"),
  email: z.email().nullable(),
  isActive: z.boolean(),
  systemRoleId: z.uuid().nullable(),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type UpdateUserDto = __TypedOpenapi.Schemas.UpdateUserDto;
export const UpdateUserDto = z
  .strictObject({
    isActive: z.boolean().describe("Deactivating an account also ends its session"),
    systemRoleId: z
      .uuid()
      .describe("A system role, or null to remove it")
      .nullable()
      .describe("A system role, or null to remove it"),
  })
  .partial();

export type PermissionDefinitionResponseDto = __TypedOpenapi.Schemas.PermissionDefinitionResponseDto;
export const PermissionDefinitionResponseDto = z.strictObject({
  resource: Resource,
  action: Action,
  description: z.string(),
  projectAssignable: z.boolean().describe("False when only a system role may hold the permission"),
});

export type RoleScope = __TypedOpenapi.Schemas.RoleScope;
export const RoleScope = z.enum(["system", "project"]);

export type RoleResponseDto = __TypedOpenapi.Schemas.RoleResponseDto;
export const RoleResponseDto = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  scope: RoleScope,
  isSystem: z.boolean().describe("Predefined (seeded) roles cannot be changed or deleted"),
  projectId: z
    .uuid()
    .describe("The project a custom role belongs to; null for predefined roles")
    .nullable()
    .describe("The project a custom role belongs to; null for predefined roles"),
  permissions: z.array(PermissionDto),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type CreateRoleDto = __TypedOpenapi.Schemas.CreateRoleDto;
export const CreateRoleDto = z.strictObject({
  name: z.string().min(2).max(100),
  description: z.string().max(500).default(""),
  permissions: z
    .array(PermissionDto)
    .max(100)
    .describe("Only permissions a project role may hold, and only ones you hold yourself"),
});

export type UpdateRoleDto = __TypedOpenapi.Schemas.UpdateRoleDto;
export const UpdateRoleDto = z
  .strictObject({
    name: z.string().min(2).max(100),
    description: z.string().max(500),
    permissions: z.array(PermissionDto).max(100).describe("Replaces the whole permission set"),
  })
  .partial();

export type MemberResponseDto = __TypedOpenapi.Schemas.MemberResponseDto;
export const MemberResponseDto = z.strictObject({
  projectId: z.uuid(),
  userId: z.uuid(),
  username: z.string(),
  phone: z.string().describe("Present only for yourself and for callers with system-level access").optional(),
  email: z
    .email()
    .describe("Present only for yourself and for callers with system-level access")
    .nullable()
    .describe("Present only for yourself and for callers with system-level access")
    .optional(),
  roleId: z.uuid(),
  roleName: z.string(),
  roleIsSystem: z.boolean(),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type AddMemberDto = __TypedOpenapi.Schemas.AddMemberDto;
export const AddMemberDto = z.strictObject({
  username: z
    .string()
    .regex(new RegExp("^(?!\\d+$)[a-z0-9_]{3,32}$"))
    .describe("Username of an active, phone-verified account"),
  roleId: z.uuid().describe("A predefined project role or a custom role of this project"),
});

export type UpdateMemberDto = __TypedOpenapi.Schemas.UpdateMemberDto;
export const UpdateMemberDto = z.strictObject({
  roleId: z.uuid().describe("A predefined project role or a custom role of this project"),
});

export type CreateProjectDto = __TypedOpenapi.Schemas.CreateProjectDto;
export const CreateProjectDto = z.strictObject({ name: z.string().max(200), description: z.string().default("") });

export type ProjectResponseDto = __TypedOpenapi.Schemas.ProjectResponseDto;
export const ProjectResponseDto = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type UpdateProjectDto = __TypedOpenapi.Schemas.UpdateProjectDto;
export const UpdateProjectDto = z
  .strictObject({ name: z.string().max(200), description: z.string().default("") })
  .partial();

export type CreateBoundaryDto = __TypedOpenapi.Schemas.CreateBoundaryDto;
export const CreateBoundaryDto = z.strictObject({
  projectId: z.uuid(),
  name: z.string().max(200),
  geometry: z
    .strictObject({
      type: z.enum(["MultiPolygon", "Polygon"]),
      coordinates: z.array(z.array(z.array(z.array(z.number())))),
    })
    .partial()
    .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]"),
});

export type BoundaryResponseDto = __TypedOpenapi.Schemas.BoundaryResponseDto;
export const BoundaryResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  name: z.string(),
  geometry: z.record(z.string(), z.unknown()),
  areaM2: z.number().describe("Geodesic area in square meters"),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type UpdateBoundaryDto = __TypedOpenapi.Schemas.UpdateBoundaryDto;
export const UpdateBoundaryDto = z
  .strictObject({
    name: z.string().max(200),
    geometry: z
      .strictObject({
        type: z.enum(["MultiPolygon", "Polygon"]),
        coordinates: z.array(z.array(z.array(z.array(z.number())))),
      })
      .partial()
      .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]"),
  })
  .partial();

export type RegionStatus = __TypedOpenapi.Schemas.RegionStatus;
export const RegionStatus = z.enum(["active", "inactive"]);

export type CreateRegionDto = __TypedOpenapi.Schemas.CreateRegionDto;
export const CreateRegionDto = z.strictObject({
  projectId: z.uuid(),
  name: z.string().max(200),
  description: z.string().default(""),
  status: RegionStatus.optional(),
  boundaryId: z.uuid().describe("Existing draft boundary to use instead of geometry").optional(),
  geometry: z
    .strictObject({
      type: z.enum(["MultiPolygon", "Polygon"]),
      coordinates: z.array(z.array(z.array(z.array(z.number())))),
    })
    .partial()
    .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]")
    .optional(),
});

export type RegionResponseDto = __TypedOpenapi.Schemas.RegionResponseDto;
export const RegionResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  boundaryId: z.uuid(),
  name: z.string(),
  description: z.string(),
  status: RegionStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  blocksCount: z.number().int().describe("Number of blocks in the region. Only present in list responses").optional(),
  parcelsCount: z.number().int().describe("Number of parcels in the region. Only present in list responses").optional(),
});

export type BlockStatus = __TypedOpenapi.Schemas.BlockStatus;
export const BlockStatus = z.enum(["active", "inactive"]);

export type BlockResponseDto = __TypedOpenapi.Schemas.BlockResponseDto;
export const BlockResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  regionId: z.uuid().describe("Derived from the block outline by the database"),
  boundaryId: z.uuid(),
  name: z.string(),
  description: z.string(),
  status: BlockStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  parcelsCount: z.number().int().describe("Number of parcels in the block. Only present in list responses").optional(),
  region: RegionResponseDto.optional(),
});

export type ParcelStatus = __TypedOpenapi.Schemas.ParcelStatus;
export const ParcelStatus = z.enum(["active", "inactive"]);

export type ParcelResponseDto = __TypedOpenapi.Schemas.ParcelResponseDto;
export const ParcelResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  regionId: z.uuid().describe("Derived from the parcel outline by the database"),
  blockId: z
    .uuid()
    .describe("Derived from the parcel outline by the database; null when no block contains the parcel")
    .nullable()
    .describe("Derived from the parcel outline by the database; null when no block contains the parcel")
    .optional(),
  boundaryId: z.uuid(),
  name: z.string(),
  status: ParcelStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  regionOccupancyPct: z.number().min(0).max(100).describe("% of the region this parcel occupies"),
  blockOccupancyPct: z
    .number()
    .min(0)
    .max(100)
    .describe("% of the block this parcel occupies")
    .nullable()
    .describe("% of the block this parcel occupies")
    .optional(),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  ownershipsCount: z
    .number()
    .int()
    .describe("Number of owners holding a share. Only present in list responses")
    .optional(),
  region: RegionResponseDto.optional(),
  block: BlockResponseDto.and(z.record(z.string(), z.unknown()).nullable())
    .describe("Only present in list responses; null when the parcel is in no block")
    .nullable()
    .describe("Only present in list responses; null when the parcel is in no block")
    .optional(),
});

export type RegionDetailResponseDto = __TypedOpenapi.Schemas.RegionDetailResponseDto;
export const RegionDetailResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  boundaryId: z.uuid(),
  name: z.string(),
  description: z.string(),
  status: RegionStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  blocksCount: z.number().int().describe("Number of blocks in the region. Only present in list responses").optional(),
  parcelsCount: z.number().int().describe("Number of parcels in the region. Only present in list responses").optional(),
  project: ProjectResponseDto,
  boundary: BoundaryResponseDto,
  blocks: z.array(BlockResponseDto),
  parcels: z.array(ParcelResponseDto),
});

export type UpdateRegionDto = __TypedOpenapi.Schemas.UpdateRegionDto;
export const UpdateRegionDto = z
  .strictObject({
    name: z.string().max(200),
    description: z.string().default(""),
    status: RegionStatus,
    geometry: z
      .strictObject({
        type: z.enum(["MultiPolygon", "Polygon"]),
        coordinates: z.array(z.array(z.array(z.array(z.number())))),
      })
      .partial()
      .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]"),
  })
  .partial();

export type CreateBlockDto = __TypedOpenapi.Schemas.CreateBlockDto;
export const CreateBlockDto = z.strictObject({
  projectId: z.uuid(),
  name: z.string().max(200),
  description: z.string().default(""),
  status: BlockStatus.optional(),
  boundaryId: z.uuid().describe("Existing draft boundary to use instead of geometry").optional(),
  geometry: z
    .strictObject({
      type: z.enum(["MultiPolygon", "Polygon"]),
      coordinates: z.array(z.array(z.array(z.array(z.number())))),
    })
    .partial()
    .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]")
    .optional(),
});

export type BlockDetailResponseDto = __TypedOpenapi.Schemas.BlockDetailResponseDto;
export const BlockDetailResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  regionId: z.uuid().describe("Derived from the block outline by the database"),
  boundaryId: z.uuid(),
  name: z.string(),
  description: z.string(),
  status: BlockStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  parcelsCount: z.number().int().describe("Number of parcels in the block. Only present in list responses").optional(),
  project: ProjectResponseDto,
  region: RegionResponseDto,
  boundary: BoundaryResponseDto,
  parcels: z.array(ParcelResponseDto),
});

export type UpdateBlockDto = __TypedOpenapi.Schemas.UpdateBlockDto;
export const UpdateBlockDto = z
  .strictObject({
    name: z.string().max(200),
    description: z.string().default(""),
    status: BlockStatus,
    geometry: z
      .strictObject({
        type: z.enum(["MultiPolygon", "Polygon"]),
        coordinates: z.array(z.array(z.array(z.array(z.number())))),
      })
      .partial()
      .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]"),
  })
  .partial();

export type CreateParcelDto = __TypedOpenapi.Schemas.CreateParcelDto;
export const CreateParcelDto = z.strictObject({
  projectId: z.uuid(),
  name: z.string().min(1).max(200),
  status: ParcelStatus.optional(),
  boundaryId: z.uuid().describe("Existing draft boundary to use instead of geometry").optional(),
  geometry: z
    .strictObject({
      type: z.enum(["MultiPolygon", "Polygon"]),
      coordinates: z.array(z.array(z.array(z.array(z.number())))),
    })
    .partial()
    .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]")
    .optional(),
});

export type OwnerResponseDto = __TypedOpenapi.Schemas.OwnerResponseDto;
export const OwnerResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  nationalId: z.string(),
  status: z.enum(["active", "inactive", "pending"]),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type OwnershipWithOwnerResponseDto = __TypedOpenapi.Schemas.OwnershipWithOwnerResponseDto;
export const OwnershipWithOwnerResponseDto = z.strictObject({
  parcelId: z.uuid(),
  ownerId: z.uuid(),
  sharePct: z.number().min(0.0001).max(100),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  owner: OwnerResponseDto,
});

export type ParcelDetailResponseDto = __TypedOpenapi.Schemas.ParcelDetailResponseDto;
export const ParcelDetailResponseDto = z.strictObject({
  id: z.uuid(),
  projectId: z.uuid(),
  regionId: z.uuid().describe("Derived from the parcel outline by the database"),
  blockId: z
    .uuid()
    .describe("Derived from the parcel outline by the database; null when no block contains the parcel")
    .nullable()
    .describe("Derived from the parcel outline by the database; null when no block contains the parcel")
    .optional(),
  boundaryId: z.uuid(),
  name: z.string(),
  status: ParcelStatus,
  areaM2: z.number().describe("Geodesic area in square meters"),
  regionOccupancyPct: z.number().min(0).max(100).describe("% of the region this parcel occupies"),
  blockOccupancyPct: z
    .number()
    .min(0)
    .max(100)
    .describe("% of the block this parcel occupies")
    .nullable()
    .describe("% of the block this parcel occupies")
    .optional(),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  ownershipsCount: z
    .number()
    .int()
    .describe("Number of owners holding a share. Only present in list responses")
    .optional(),
  project: ProjectResponseDto,
  region: RegionResponseDto,
  block: BlockResponseDto.and(z.record(z.string(), z.unknown()).nullable()).nullable(),
  boundary: BoundaryResponseDto,
  ownerships: z.array(OwnershipWithOwnerResponseDto),
});

export type UpdateParcelDto = __TypedOpenapi.Schemas.UpdateParcelDto;
export const UpdateParcelDto = z
  .strictObject({
    name: z.string().min(1).max(200),
    status: ParcelStatus,
    geometry: z
      .strictObject({
        type: z.enum(["MultiPolygon", "Polygon"]),
        coordinates: z.array(z.array(z.array(z.array(z.number())))),
      })
      .partial()
      .describe("GeoJSON MultiPolygon, WGS 84, [longitude, latitude]"),
  })
  .partial();

export type AssignOwnerDto = __TypedOpenapi.Schemas.AssignOwnerDto;
export const AssignOwnerDto = z.strictObject({
  ownerId: z.uuid().describe("Must belong to the same project as the parcel"),
  sharePct: z.number().min(0.0001).max(100).describe("Percent of the parcel; all shares of a parcel sum to ≤ 100"),
});

export type OwnershipResponseDto = __TypedOpenapi.Schemas.OwnershipResponseDto;
export const OwnershipResponseDto = z.strictObject({
  parcelId: z.uuid(),
  ownerId: z.uuid(),
  sharePct: z.number().min(0.0001).max(100),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
});

export type UpdateOwnershipDto = __TypedOpenapi.Schemas.UpdateOwnershipDto;
export const UpdateOwnershipDto = z.strictObject({
  sharePct: z.number().min(0.0001).max(100).describe("Percent of the parcel; all shares of a parcel sum to ≤ 100"),
});

export type CreateOwnerDto = __TypedOpenapi.Schemas.CreateOwnerDto;
export const CreateOwnerDto = z.strictObject({
  projectId: z.uuid(),
  name: z.string().max(200),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().max(320).nullable().optional(),
  notes: z.string().nullable().optional(),
  nationalId: z.string(),
  status: z.enum(["active", "inactive", "pending"]).default("pending"),
});

export type UpdateOwnerDto = __TypedOpenapi.Schemas.UpdateOwnerDto;
export const UpdateOwnerDto = z
  .strictObject({
    name: z.string().max(200),
    phone: z.string().max(50).nullable(),
    email: z.string().max(320).nullable(),
    notes: z.string().nullable(),
    nationalId: z.string(),
    status: z.enum(["active", "inactive", "pending"]).default("pending"),
  })
  .partial();

export type OwnershipWithParcelResponseDto = __TypedOpenapi.Schemas.OwnershipWithParcelResponseDto;
export const OwnershipWithParcelResponseDto = z.strictObject({
  parcelId: z.uuid(),
  ownerId: z.uuid(),
  sharePct: z.number().min(0.0001).max(100),
  createdAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  updatedAt: z.iso.datetime().transform((s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid Date");
    return d;
  }),
  parcel: ParcelResponseDto,
});

// </Schemas>

// <Endpoints>
export type post_AuthController_register = __TypedOpenapi.Endpoints.post_AuthController_register;
export const post_AuthController_register = {
  method: z.literal("POST"),
  path: z.literal("/auth/register"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: RegisterUserDto },
  responses: {
    202: OtpDispatchResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    429: ErrorResponseDto,
  },
};

export type post_AuthController_verifyRegistration = __TypedOpenapi.Endpoints.post_AuthController_verifyRegistration;
export const post_AuthController_verifyRegistration = {
  method: z.literal("POST"),
  path: z.literal("/auth/register/verify"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: VerifyRegistrationDto },
  responses: {
    204: z.unknown(),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    429: ErrorResponseDto,
  },
};

export type post_AuthController_login = __TypedOpenapi.Endpoints.post_AuthController_login;
export const post_AuthController_login = {
  method: z.literal("POST"),
  path: z.literal("/auth/login"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: LoginDto },
  responses: {
    200: SessionResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
  },
  responseHeaders: { 200: z.strictObject({ "Set-Cookie": z.string() }) },
};

export type post_AuthController_logout = __TypedOpenapi.Endpoints.post_AuthController_logout;
export const post_AuthController_logout = {
  method: z.literal("POST"),
  path: z.literal("/auth/logout"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: z.never(),
  responses: { 204: z.unknown(), 401: ErrorResponseDto, 403: ErrorResponseDto },
};

export type post_AuthController_renew = __TypedOpenapi.Endpoints.post_AuthController_renew;
export const post_AuthController_renew = {
  method: z.literal("POST"),
  path: z.literal("/auth/session/renew"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: z.never(),
  responses: { 200: SessionResponseDto, 401: ErrorResponseDto, 403: ErrorResponseDto },
  responseHeaders: { 200: z.strictObject({ "Set-Cookie": z.string() }) },
};

export type get_AuthController_me = __TypedOpenapi.Endpoints.get_AuthController_me;
export const get_AuthController_me = {
  method: z.literal("GET"),
  path: z.literal("/auth/me"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: z.never(),
  responses: { 200: CurrentUserResponseDto, 401: ErrorResponseDto, 403: ErrorResponseDto },
};

export type post_AuthController_forgotPassword = __TypedOpenapi.Endpoints.post_AuthController_forgotPassword;
export const post_AuthController_forgotPassword = {
  method: z.literal("POST"),
  path: z.literal("/auth/password/forgot"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: ForgotPasswordDto },
  responses: {
    202: OtpDispatchResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    429: ErrorResponseDto,
  },
};

export type post_AuthController_resetPassword = __TypedOpenapi.Endpoints.post_AuthController_resetPassword;
export const post_AuthController_resetPassword = {
  method: z.literal("POST"),
  path: z.literal("/auth/password/reset"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: ResetPasswordDto },
  responses: {
    204: z.unknown(),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    429: ErrorResponseDto,
  },
};

export type get_UsersController_list = __TypedOpenapi.Endpoints.get_UsersController_list;
export const get_UsersController_list = {
  method: z.literal("GET"),
  path: z.literal("/users"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().max(64),
      })
      .partial()
      .optional(),
  },
  responses: {
    200: PaginatedResponseDto.and(z.strictObject({ items: z.array(UserResponseDto) }).partial()),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
  },
};

export type get_UsersController_get = __TypedOpenapi.Endpoints.get_UsersController_get;
export const get_UsersController_get = {
  method: z.literal("GET"),
  path: z.literal("/users/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: {
    200: UserResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
  },
};

export type patch_UsersController_update = __TypedOpenapi.Endpoints.patch_UsersController_update;
export const patch_UsersController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/users/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateUserDto },
  responses: {
    200: UserResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
  },
};

export type get_PermissionsController_list = __TypedOpenapi.Endpoints.get_PermissionsController_list;
export const get_PermissionsController_list = {
  method: z.literal("GET"),
  path: z.literal("/permissions"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: z.never(),
  responses: { 200: z.array(PermissionDefinitionResponseDto), 401: ErrorResponseDto, 403: ErrorResponseDto },
};

export type get_SystemRolesController_list = __TypedOpenapi.Endpoints.get_SystemRolesController_list;
export const get_SystemRolesController_list = {
  method: z.literal("GET"),
  path: z.literal("/roles/system"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: z.never(),
  responses: { 200: z.array(RoleResponseDto), 401: ErrorResponseDto, 403: ErrorResponseDto },
};

export type get_ProjectRolesController_list = __TypedOpenapi.Endpoints.get_ProjectRolesController_list;
export const get_ProjectRolesController_list = {
  method: z.literal("GET"),
  path: z.literal("/projects/{projectId}/roles"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string() }) },
  responses: {
    200: z.array(RoleResponseDto),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
  },
};

export type post_ProjectRolesController_create = __TypedOpenapi.Endpoints.post_ProjectRolesController_create;
export const post_ProjectRolesController_create = {
  method: z.literal("POST"),
  path: z.literal("/projects/{projectId}/roles"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string() }), body: CreateRoleDto },
  responses: {
    201: RoleResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
    422: ErrorResponseDto,
  },
};

export type get_ProjectRolesController_get = __TypedOpenapi.Endpoints.get_ProjectRolesController_get;
export const get_ProjectRolesController_get = {
  method: z.literal("GET"),
  path: z.literal("/projects/{projectId}/roles/{roleId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string(), roleId: z.string() }) },
  responses: {
    200: RoleResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
  },
};

export type patch_ProjectRolesController_update = __TypedOpenapi.Endpoints.patch_ProjectRolesController_update;
export const patch_ProjectRolesController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/projects/{projectId}/roles/{roleId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string(), roleId: z.string() }), body: UpdateRoleDto },
  responses: {
    200: RoleResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
    422: ErrorResponseDto,
  },
};

export type delete_ProjectRolesController_remove = __TypedOpenapi.Endpoints.delete_ProjectRolesController_remove;
export const delete_ProjectRolesController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/projects/{projectId}/roles/{roleId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string(), roleId: z.string() }) },
  responses: {
    204: z.unknown(),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
  },
};

export type get_ProjectMembersController_list = __TypedOpenapi.Endpoints.get_ProjectMembersController_list;
export const get_ProjectMembersController_list = {
  method: z.literal("GET"),
  path: z.literal("/projects/{projectId}/members"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string() }) },
  responses: {
    200: z.array(MemberResponseDto),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
  },
};

export type post_ProjectMembersController_add = __TypedOpenapi.Endpoints.post_ProjectMembersController_add;
export const post_ProjectMembersController_add = {
  method: z.literal("POST"),
  path: z.literal("/projects/{projectId}/members"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string() }), body: AddMemberDto },
  responses: {
    201: MemberResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
  },
};

export type patch_ProjectMembersController_changeRole =
  __TypedOpenapi.Endpoints.patch_ProjectMembersController_changeRole;
export const patch_ProjectMembersController_changeRole = {
  method: z.literal("PATCH"),
  path: z.literal("/projects/{projectId}/members/{userId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string(), userId: z.string() }), body: UpdateMemberDto },
  responses: {
    200: MemberResponseDto,
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
  },
};

export type delete_ProjectMembersController_remove = __TypedOpenapi.Endpoints.delete_ProjectMembersController_remove;
export const delete_ProjectMembersController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/projects/{projectId}/members/{userId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ projectId: z.string(), userId: z.string() }) },
  responses: {
    204: z.unknown(),
    400: z
      .union([ValidationErrorResponseDto, ErrorResponseDto])
      .refine(
        (data) =>
          [ValidationErrorResponseDto.safeParse(data).success, ErrorResponseDto.safeParse(data).success].filter(Boolean)
            .length === 1,
        { message: "oneOf" },
      ),
    401: ErrorResponseDto,
    403: ErrorResponseDto,
    404: ErrorResponseDto,
    409: ErrorResponseDto,
  },
};

export type post_ProjectController_create = __TypedOpenapi.Endpoints.post_ProjectController_create;
export const post_ProjectController_create = {
  method: z.literal("POST"),
  path: z.literal("/projects"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateProjectDto },
  responses: { 201: ProjectResponseDto },
};

export type get_ProjectController_list = __TypedOpenapi.Endpoints.get_ProjectController_list;
export const get_ProjectController_list = {
  method: z.literal("GET"),
  path: z.literal("/projects"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(ProjectResponseDto) }).partial()) },
};

export type get_ProjectController_get = __TypedOpenapi.Endpoints.get_ProjectController_get;
export const get_ProjectController_get = {
  method: z.literal("GET"),
  path: z.literal("/projects/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: ProjectResponseDto },
};

export type patch_ProjectController_update = __TypedOpenapi.Endpoints.patch_ProjectController_update;
export const patch_ProjectController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/projects/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateProjectDto },
  responses: { 200: ProjectResponseDto },
};

export type delete_ProjectController_remove = __TypedOpenapi.Endpoints.delete_ProjectController_remove;
export const delete_ProjectController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/projects/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type post_BoundaryController_create = __TypedOpenapi.Endpoints.post_BoundaryController_create;
export const post_BoundaryController_create = {
  method: z.literal("POST"),
  path: z.literal("/boundaries"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateBoundaryDto },
  responses: { 201: BoundaryResponseDto },
};

export type get_BoundaryController_list = __TypedOpenapi.Endpoints.get_BoundaryController_list;
export const get_BoundaryController_list = {
  method: z.literal("GET"),
  path: z.literal("/boundaries"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        projectId: z.uuid(),
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(BoundaryResponseDto) }).partial()) },
};

export type get_BoundaryController_get = __TypedOpenapi.Endpoints.get_BoundaryController_get;
export const get_BoundaryController_get = {
  method: z.literal("GET"),
  path: z.literal("/boundaries/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: BoundaryResponseDto },
};

export type patch_BoundaryController_update = __TypedOpenapi.Endpoints.patch_BoundaryController_update;
export const patch_BoundaryController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/boundaries/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateBoundaryDto },
  responses: { 200: BoundaryResponseDto },
};

export type delete_BoundaryController_remove = __TypedOpenapi.Endpoints.delete_BoundaryController_remove;
export const delete_BoundaryController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/boundaries/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type post_RegionController_create = __TypedOpenapi.Endpoints.post_RegionController_create;
export const post_RegionController_create = {
  method: z.literal("POST"),
  path: z.literal("/regions"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateRegionDto },
  responses: { 201: RegionResponseDto },
};

export type get_RegionController_list = __TypedOpenapi.Endpoints.get_RegionController_list;
export const get_RegionController_list = {
  method: z.literal("GET"),
  path: z.literal("/regions"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        projectId: z.uuid(),
        status: RegionStatus,
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(RegionResponseDto) }).partial()) },
};

export type get_RegionController_get = __TypedOpenapi.Endpoints.get_RegionController_get;
export const get_RegionController_get = {
  method: z.literal("GET"),
  path: z.literal("/regions/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: RegionResponseDto },
};

export type patch_RegionController_update = __TypedOpenapi.Endpoints.patch_RegionController_update;
export const patch_RegionController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/regions/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateRegionDto },
  responses: { 200: RegionResponseDto },
};

export type delete_RegionController_remove = __TypedOpenapi.Endpoints.delete_RegionController_remove;
export const delete_RegionController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/regions/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type get_RegionController_getDetail = __TypedOpenapi.Endpoints.get_RegionController_getDetail;
export const get_RegionController_getDetail = {
  method: z.literal("GET"),
  path: z.literal("/regions/{id}/detail"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: RegionDetailResponseDto },
};

export type get_RegionController_listParcels = __TypedOpenapi.Endpoints.get_RegionController_listParcels;
export const get_RegionController_listParcels = {
  method: z.literal("GET"),
  path: z.literal("/regions/{id}/parcels"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: z.array(ParcelResponseDto) },
};

export type post_BlockController_create = __TypedOpenapi.Endpoints.post_BlockController_create;
export const post_BlockController_create = {
  method: z.literal("POST"),
  path: z.literal("/blocks"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateBlockDto },
  responses: { 201: BlockResponseDto },
};

export type get_BlockController_list = __TypedOpenapi.Endpoints.get_BlockController_list;
export const get_BlockController_list = {
  method: z.literal("GET"),
  path: z.literal("/blocks"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        projectId: z.uuid(),
        regionId: z.uuid(),
        status: BlockStatus,
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(BlockResponseDto) }).partial()) },
};

export type get_BlockController_get = __TypedOpenapi.Endpoints.get_BlockController_get;
export const get_BlockController_get = {
  method: z.literal("GET"),
  path: z.literal("/blocks/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: BlockResponseDto },
};

export type patch_BlockController_update = __TypedOpenapi.Endpoints.patch_BlockController_update;
export const patch_BlockController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/blocks/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateBlockDto },
  responses: { 200: BlockResponseDto },
};

export type delete_BlockController_remove = __TypedOpenapi.Endpoints.delete_BlockController_remove;
export const delete_BlockController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/blocks/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type get_BlockController_getDetail = __TypedOpenapi.Endpoints.get_BlockController_getDetail;
export const get_BlockController_getDetail = {
  method: z.literal("GET"),
  path: z.literal("/blocks/{id}/detail"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: BlockDetailResponseDto },
};

export type get_BlockController_listParcels = __TypedOpenapi.Endpoints.get_BlockController_listParcels;
export const get_BlockController_listParcels = {
  method: z.literal("GET"),
  path: z.literal("/blocks/{id}/parcels"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: z.array(ParcelResponseDto) },
};

export type post_ParcelController_create = __TypedOpenapi.Endpoints.post_ParcelController_create;
export const post_ParcelController_create = {
  method: z.literal("POST"),
  path: z.literal("/parcels"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateParcelDto },
  responses: { 201: ParcelResponseDto },
};

export type get_ParcelController_list = __TypedOpenapi.Endpoints.get_ParcelController_list;
export const get_ParcelController_list = {
  method: z.literal("GET"),
  path: z.literal("/parcels"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        projectId: z.uuid(),
        regionId: z.uuid(),
        blockId: z.uuid(),
        status: ParcelStatus,
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(ParcelResponseDto) }).partial()) },
};

export type get_ParcelController_get = __TypedOpenapi.Endpoints.get_ParcelController_get;
export const get_ParcelController_get = {
  method: z.literal("GET"),
  path: z.literal("/parcels/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: ParcelResponseDto },
};

export type patch_ParcelController_update = __TypedOpenapi.Endpoints.patch_ParcelController_update;
export const patch_ParcelController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/parcels/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateParcelDto },
  responses: { 200: ParcelResponseDto },
};

export type delete_ParcelController_remove = __TypedOpenapi.Endpoints.delete_ParcelController_remove;
export const delete_ParcelController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/parcels/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type get_ParcelController_getDetail = __TypedOpenapi.Endpoints.get_ParcelController_getDetail;
export const get_ParcelController_getDetail = {
  method: z.literal("GET"),
  path: z.literal("/parcels/{id}/detail"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: ParcelDetailResponseDto },
};

export type get_ParcelController_listOwners = __TypedOpenapi.Endpoints.get_ParcelController_listOwners;
export const get_ParcelController_listOwners = {
  method: z.literal("GET"),
  path: z.literal("/parcels/{id}/owners"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: z.array(OwnershipWithOwnerResponseDto) },
};

export type post_ParcelController_assignOwner = __TypedOpenapi.Endpoints.post_ParcelController_assignOwner;
export const post_ParcelController_assignOwner = {
  method: z.literal("POST"),
  path: z.literal("/parcels/{id}/owners"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: AssignOwnerDto },
  responses: { 201: OwnershipResponseDto },
};

export type patch_ParcelController_updateOwnership = __TypedOpenapi.Endpoints.patch_ParcelController_updateOwnership;
export const patch_ParcelController_updateOwnership = {
  method: z.literal("PATCH"),
  path: z.literal("/parcels/{id}/owners/{ownerId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string(), ownerId: z.string() }), body: UpdateOwnershipDto },
  responses: { 200: OwnershipResponseDto },
};

export type delete_ParcelController_removeOwner = __TypedOpenapi.Endpoints.delete_ParcelController_removeOwner;
export const delete_ParcelController_removeOwner = {
  method: z.literal("DELETE"),
  path: z.literal("/parcels/{id}/owners/{ownerId}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string(), ownerId: z.string() }) },
  responses: { 204: z.unknown() },
};

export type post_OwnerController_create = __TypedOpenapi.Endpoints.post_OwnerController_create;
export const post_OwnerController_create = {
  method: z.literal("POST"),
  path: z.literal("/owners"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { body: CreateOwnerDto },
  responses: { 201: OwnerResponseDto },
};

export type get_OwnerController_list = __TypedOpenapi.Endpoints.get_OwnerController_list;
export const get_OwnerController_list = {
  method: z.literal("GET"),
  path: z.literal("/owners"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: {
    query: z
      .strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        projectId: z.uuid(),
        search: z.string(),
      })
      .partial()
      .optional(),
  },
  responses: { 200: PaginatedResponseDto.and(z.strictObject({ items: z.array(OwnerResponseDto) }).partial()) },
};

export type get_OwnerController_get = __TypedOpenapi.Endpoints.get_OwnerController_get;
export const get_OwnerController_get = {
  method: z.literal("GET"),
  path: z.literal("/owners/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: OwnerResponseDto },
};

export type patch_OwnerController_update = __TypedOpenapi.Endpoints.patch_OwnerController_update;
export const patch_OwnerController_update = {
  method: z.literal("PATCH"),
  path: z.literal("/owners/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }), body: UpdateOwnerDto },
  responses: { 200: OwnerResponseDto },
};

export type delete_OwnerController_remove = __TypedOpenapi.Endpoints.delete_OwnerController_remove;
export const delete_OwnerController_remove = {
  method: z.literal("DELETE"),
  path: z.literal("/owners/{id}"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 204: z.unknown() },
};

export type get_OwnerController_listParcels = __TypedOpenapi.Endpoints.get_OwnerController_listParcels;
export const get_OwnerController_listParcels = {
  method: z.literal("GET"),
  path: z.literal("/owners/{id}/parcels"),
  requestFormat: z.literal("json"),
  responseFormat: z.literal("json"),
  parameters: { path: z.strictObject({ id: z.string() }) },
  responses: { 200: z.array(OwnershipWithParcelResponseDto) },
};

// </Endpoints>

// <EndpointByMethod>
export const EndpointByMethod = {
  post: {
    "/auth/register": post_AuthController_register,
    "/auth/register/verify": post_AuthController_verifyRegistration,
    "/auth/login": post_AuthController_login,
    "/auth/logout": post_AuthController_logout,
    "/auth/session/renew": post_AuthController_renew,
    "/auth/password/forgot": post_AuthController_forgotPassword,
    "/auth/password/reset": post_AuthController_resetPassword,
    "/projects/{projectId}/roles": post_ProjectRolesController_create,
    "/projects/{projectId}/members": post_ProjectMembersController_add,
    "/projects": post_ProjectController_create,
    "/boundaries": post_BoundaryController_create,
    "/regions": post_RegionController_create,
    "/blocks": post_BlockController_create,
    "/parcels": post_ParcelController_create,
    "/parcels/{id}/owners": post_ParcelController_assignOwner,
    "/owners": post_OwnerController_create,
  },
  get: {
    "/auth/me": get_AuthController_me,
    "/users": get_UsersController_list,
    "/users/{id}": get_UsersController_get,
    "/permissions": get_PermissionsController_list,
    "/roles/system": get_SystemRolesController_list,
    "/projects/{projectId}/roles": get_ProjectRolesController_list,
    "/projects/{projectId}/roles/{roleId}": get_ProjectRolesController_get,
    "/projects/{projectId}/members": get_ProjectMembersController_list,
    "/projects": get_ProjectController_list,
    "/projects/{id}": get_ProjectController_get,
    "/boundaries": get_BoundaryController_list,
    "/boundaries/{id}": get_BoundaryController_get,
    "/regions": get_RegionController_list,
    "/regions/{id}": get_RegionController_get,
    "/regions/{id}/detail": get_RegionController_getDetail,
    "/regions/{id}/parcels": get_RegionController_listParcels,
    "/blocks": get_BlockController_list,
    "/blocks/{id}": get_BlockController_get,
    "/blocks/{id}/detail": get_BlockController_getDetail,
    "/blocks/{id}/parcels": get_BlockController_listParcels,
    "/parcels": get_ParcelController_list,
    "/parcels/{id}": get_ParcelController_get,
    "/parcels/{id}/detail": get_ParcelController_getDetail,
    "/parcels/{id}/owners": get_ParcelController_listOwners,
    "/owners": get_OwnerController_list,
    "/owners/{id}": get_OwnerController_get,
    "/owners/{id}/parcels": get_OwnerController_listParcels,
  },
  patch: {
    "/users/{id}": patch_UsersController_update,
    "/projects/{projectId}/roles/{roleId}": patch_ProjectRolesController_update,
    "/projects/{projectId}/members/{userId}": patch_ProjectMembersController_changeRole,
    "/projects/{id}": patch_ProjectController_update,
    "/boundaries/{id}": patch_BoundaryController_update,
    "/regions/{id}": patch_RegionController_update,
    "/blocks/{id}": patch_BlockController_update,
    "/parcels/{id}": patch_ParcelController_update,
    "/parcels/{id}/owners/{ownerId}": patch_ParcelController_updateOwnership,
    "/owners/{id}": patch_OwnerController_update,
  },
  delete: {
    "/projects/{projectId}/roles/{roleId}": delete_ProjectRolesController_remove,
    "/projects/{projectId}/members/{userId}": delete_ProjectMembersController_remove,
    "/projects/{id}": delete_ProjectController_remove,
    "/boundaries/{id}": delete_BoundaryController_remove,
    "/regions/{id}": delete_RegionController_remove,
    "/blocks/{id}": delete_BlockController_remove,
    "/parcels/{id}": delete_ParcelController_remove,
    "/parcels/{id}/owners/{ownerId}": delete_ParcelController_removeOwner,
    "/owners/{id}": delete_OwnerController_remove,
  },
} satisfies {
  [M in keyof __TypedOpenapi.EndpointByMethod]: { [P in keyof __TypedOpenapi.EndpointByMethod[M]]: unknown };
};
export type EndpointByMethod = __TypedOpenapi.EndpointByMethod;
// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type PostEndpoints = EndpointByMethod["post"];
export type GetEndpoints = EndpointByMethod["get"];
export type PatchEndpoints = EndpointByMethod["patch"];
export type DeleteEndpoints = EndpointByMethod["delete"];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: unknown;
  header?: unknown;
  path?: unknown;
  cookie?: unknown;
};

export type MutationMethod = "post" | "put" | "patch" | "delete";
export type Method = "get" | "head" | "options" | "trace" | MutationMethod;

export type RequestFormat = "json" | "form-data" | "form-url" | "binary" | "text";
export type ResponseFormat = "json" | "sse";
export type SecurityRequirements = readonly (readonly string[])[];

// <EndpointRequestFormats>
/** Non-json request body encodings; missing entries default to `"json"`. */
export const endpointRequestFormats = {} as Partial<{
  [M in keyof EndpointByMethod]: Partial<{ [P in keyof EndpointByMethod[M]]: RequestFormat }>;
}>;
// </EndpointRequestFormats>

// <EndpointParameterStyles>
export type ParameterSerialization = { style: string; explode: boolean; allowReserved: boolean };
export type EndpointParameterStyles = Partial<
  Record<"query" | "path" | "header" | "cookie", Record<string, ParameterSerialization>>
>;
/** OpenAPI parameter styles used by the built-in encoders. */
export const endpointParameterStyles = {
  get: {
    "/users": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/users/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/projects/{projectId}/roles": { path: { projectId: { style: "simple", explode: false, allowReserved: false } } },
    "/projects/{projectId}/roles/{roleId}": {
      path: {
        projectId: { style: "simple", explode: false, allowReserved: false },
        roleId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/projects/{projectId}/members": { path: { projectId: { style: "simple", explode: false, allowReserved: false } } },
    "/projects": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/projects/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/boundaries": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        projectId: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/boundaries/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/regions": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        projectId: { style: "form", explode: true, allowReserved: false },
        status: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/regions/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/regions/{id}/detail": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/regions/{id}/parcels": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/blocks": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        projectId: { style: "form", explode: true, allowReserved: false },
        regionId: { style: "form", explode: true, allowReserved: false },
        status: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/blocks/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/blocks/{id}/detail": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/blocks/{id}/parcels": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        projectId: { style: "form", explode: true, allowReserved: false },
        regionId: { style: "form", explode: true, allowReserved: false },
        blockId: { style: "form", explode: true, allowReserved: false },
        status: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/parcels/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}/detail": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}/owners": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/owners": {
      query: {
        page: { style: "form", explode: true, allowReserved: false },
        limit: { style: "form", explode: true, allowReserved: false },
        projectId: { style: "form", explode: true, allowReserved: false },
        search: { style: "form", explode: true, allowReserved: false },
      },
    },
    "/owners/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/owners/{id}/parcels": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
  },
  patch: {
    "/users/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/projects/{projectId}/roles/{roleId}": {
      path: {
        projectId: { style: "simple", explode: false, allowReserved: false },
        roleId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/projects/{projectId}/members/{userId}": {
      path: {
        projectId: { style: "simple", explode: false, allowReserved: false },
        userId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/projects/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/boundaries/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/regions/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/blocks/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}/owners/{ownerId}": {
      path: {
        id: { style: "simple", explode: false, allowReserved: false },
        ownerId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/owners/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
  },
  post: {
    "/projects/{projectId}/roles": { path: { projectId: { style: "simple", explode: false, allowReserved: false } } },
    "/projects/{projectId}/members": { path: { projectId: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}/owners": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
  },
  delete: {
    "/projects/{projectId}/roles/{roleId}": {
      path: {
        projectId: { style: "simple", explode: false, allowReserved: false },
        roleId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/projects/{projectId}/members/{userId}": {
      path: {
        projectId: { style: "simple", explode: false, allowReserved: false },
        userId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/projects/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/boundaries/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/regions/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/blocks/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
    "/parcels/{id}/owners/{ownerId}": {
      path: {
        id: { style: "simple", explode: false, allowReserved: false },
        ownerId: { style: "simple", explode: false, allowReserved: false },
      },
    },
    "/owners/{id}": { path: { id: { style: "simple", explode: false, allowReserved: false } } },
  },
} as Partial<Record<string, Partial<Record<string, EndpointParameterStyles>>>>;
// </EndpointParameterStyles>

// <EndpointResponseFormats>
/** Non-json response body modes; missing entries default to `"json"`. SSE skips JSON parse + output validation. */
export const endpointResponseFormats = {} as Partial<{
  [M in keyof EndpointByMethod]: Partial<{ [P in keyof EndpointByMethod[M]]: ResponseFormat }>;
}>;
// </EndpointResponseFormats>

// <EndpointSecurityRequirements>
/** OpenAPI security requirements applied when an endpoint has no explicit entry. */
export const defaultSecurityRequirements = [["session"]] as SecurityRequirements;
/** Endpoint-specific security requirements that differ from the default. */
export const endpointSecurityRequirements = {
  post: {
    "/auth/register": [],
    "/auth/register/verify": [],
    "/auth/login": [],
    "/auth/password/forgot": [],
    "/auth/password/reset": [],
  },
} as Partial<{ [M in keyof EndpointByMethod]: Partial<{ [P in keyof EndpointByMethod[M]]: SecurityRequirements }> }>;
// </EndpointSecurityRequirements>

export type DefaultEndpoint = {
  parameters?: EndpointParameters | undefined;
  responses?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
};

export type Endpoint<TConfig extends DefaultEndpoint = DefaultEndpoint> = {
  operationId: string;
  method: Method;
  path: string;
  requestFormat: RequestFormat;
  responseFormat: ResponseFormat;
  parameters?: TConfig["parameters"];
  meta: {
    alias: string;
    hasParameters: boolean;
    areParametersRequired: boolean;
  };
  responses?: TConfig["responses"];
  responseHeaders?: TConfig["responseHeaders"];
};

/**
 * Minimal response surface used by ApiClient — avoids depending on the DOM `Response`
 * global (helpful for Node without DOM lib). Structural typing accepts fetch Response.
 */
export interface FetcherResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: {
    get(name: string): string | null;
    getSetCookie?: () => string[];
  };
  /** Present on fetch Response; used for SSE / streaming bodies. */
  body?: ReadableStream<Uint8Array> | null;
  json(): Promise<unknown>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  clone(): FetcherResponse;
}

export interface Fetcher {
  decodePathParams?: (path: string, pathParams: unknown, styles?: Record<string, ParameterSerialization>) => string;
  encodeSearchParams?: (
    searchParams: unknown,
    styles?: Record<string, ParameterSerialization>,
  ) => URLSearchParams | undefined;
  /** Merge cookie params into request headers (default: Cookie header). */
  encodeCookies?: (cookies: unknown, headers: Headers) => void;
  //
  fetch: (input: {
    method: Method;
    url: URL;
    urlSearchParams?: URLSearchParams | undefined;
    parameters?: EndpointParameters | undefined;
    path: string;
    /** How to encode `parameters.body` (from OpenAPI requestBody content type). */
    requestFormat: RequestFormat;
    /** OpenAPI parameter serialization metadata for the current endpoint. */
    parameterStyles?: EndpointParameterStyles;
    /** OpenAPI security requirements for this operation. Empty means no credentials are required. */
    security?: SecurityRequirements;
    overrides?: RequestInit;
    throwOnStatusError?: boolean;
  }) => Promise<FetcherResponse>;
  parseResponseData?: (response: FetcherResponse) => Promise<unknown>;
}

export const successStatusCodes = [
  200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308,
] as const;
export type SuccessStatusCode = (typeof successStatusCodes)[number];

export const errorStatusCodes = [
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424,
  425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
] as const;
export type ErrorStatusCode = (typeof errorStatusCodes)[number];

// Taken from https://github.com/unjs/fetchdts/blob/ec4eaeab5d287116171fc1efd61f4a1ad34e4609/src/fetch.ts#L3
export interface TypedHeaders<TypedHeaderValues = unknown> extends Omit<
  Headers,
  "append" | "delete" | "get" | "getSetCookie" | "has" | "set" | "forEach"
> {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/append) */
  append: <Name extends Extract<keyof TypedHeaderValues, string> | (string & {})>(
    name: Name,
    value: Lowercase<Name> extends keyof TypedHeaderValues ? TypedHeaderValues[Lowercase<Name>] : string,
  ) => void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/delete) */
  delete: <Name extends Extract<keyof TypedHeaderValues, string> | (string & {})>(name: Name) => void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/get) */
  get: <Name extends Extract<keyof TypedHeaderValues, string> | (string & {})>(
    name: Name,
  ) => (Lowercase<Name> extends keyof TypedHeaderValues ? TypedHeaderValues[Lowercase<Name>] : string) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/getSetCookie) */
  getSetCookie: () => string[];
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/has) */
  has: <Name extends Extract<keyof TypedHeaderValues, string> | (string & {})>(name: Name) => boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/set) */
  set: <Name extends Extract<keyof TypedHeaderValues, string> | (string & {})>(
    name: Name,
    value: Lowercase<Name> extends keyof TypedHeaderValues ? TypedHeaderValues[Lowercase<Name>] : string,
  ) => void;
  forEach: (
    callbackfn: (
      value: TypedHeaderValues[keyof TypedHeaderValues] | (string & {}),
      key: Extract<keyof TypedHeaderValues, string> | (string & {}),
      parent: TypedHeaders<TypedHeaderValues>,
    ) => void,
    thisArg?: unknown,
  ) => void;
}

/** @see https://developer.mozilla.org/en-US/docs/Web/API/Response */
export interface TypedSuccessResponse<TSuccess, TStatusCode, THeaders> extends Omit<
  FetcherResponse,
  "ok" | "status" | "json" | "headers"
> {
  ok: true;
  status: TStatusCode;
  headers: never extends THeaders ? FetcherResponse["headers"] : TypedHeaders<THeaders>;
  data: TSuccess;
  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response/json) */
  json: () => Promise<TSuccess>;
}

/** @see https://developer.mozilla.org/en-US/docs/Web/API/Response */
export interface TypedErrorResponse<TData, TStatusCode, THeaders> extends Omit<
  FetcherResponse,
  "ok" | "status" | "json" | "headers"
> {
  ok: false;
  status: TStatusCode;
  headers: never extends THeaders ? FetcherResponse["headers"] : TypedHeaders<THeaders>;
  data: TData;
  /** [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Response/json) */
  json: () => Promise<TData>;
}

type StatusCodeFromKey<TKey> = TKey extends `${infer TStatusCode extends number}`
  ? TStatusCode
  : TKey extends number
    ? TKey
    : never;

export type TypedApiResponse<TAllResponses = {}, THeaders = {}> = {
  [K in keyof TAllResponses]: StatusCodeFromKey<K> extends infer TStatusCode extends number
    ? TStatusCode extends SuccessStatusCode
      ? TypedSuccessResponse<TAllResponses[K], TStatusCode, K extends keyof THeaders ? THeaders[K] : never>
      : TypedErrorResponse<TAllResponses[K], TStatusCode, K extends keyof THeaders ? THeaders[K] : never>
    : never;
}[keyof TAllResponses];

type __TypedOpenapiSchema<TOutput, TInput = TOutput> = {
  readonly __typedOpenapiOutput: TOutput;
  readonly __typedOpenapiInput: TInput;
};
type OptionalUndefinedKeys<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};
export type InferSchemaValue<T> = T extends string | number | boolean | bigint | symbol | null | undefined
  ? T
  : T extends __TypedOpenapiSchema<infer O>
    ? O
    : T extends z.ZodType
      ? z.infer<T>
      : T extends (...args: never[]) => unknown
        ? T
        : T extends object
          ? { [K in keyof T]: InferSchemaValue<T[K]> }
          : T;
type InferSchemaInputRaw<T> = T extends string | number | boolean | bigint | symbol | null | undefined
  ? T
  : T extends __TypedOpenapiSchema<infer _O, infer I>
    ? I
    : T extends z.ZodType
      ? z.input<T>
      : T extends (...args: never[]) => unknown
        ? T
        : T extends object
          ? { [K in keyof T]: InferSchemaInputRaw<T[K]> }
          : T;
type InferSchemaInput<T> = OptionalUndefinedKeys<InferSchemaInputRaw<T>>;

export type SafeApiResponse<TEndpoint> = TEndpoint extends { responses: infer TResponses }
  ? TResponses extends Record<string | number, unknown>
    ? TypedApiResponse<
        InferSchemaValue<TResponses>,
        TEndpoint extends { responseHeaders: infer THeaders } ? InferSchemaValue<THeaders> : never
      >
    : never
  : never;

export type InferResponseByStatus<TEndpoint, TStatusCode> = Extract<
  SafeApiResponse<TEndpoint>,
  { status: TStatusCode }
>;

/**
 * Success-body payload — InferSchemaValue only on success statuses.
 * Filter with extends {} like the old Extract { data: {} } so unknown bodies (e.g. 304) drop out.
 */
export type InferSuccessData<TEndpoint> = TEndpoint extends { responses: infer TResponses }
  ? {
      [K in keyof TResponses]: StatusCodeFromKey<K> extends infer TStatusCode extends number
        ? TStatusCode extends SuccessStatusCode
          ? Extract<InferSchemaValue<TResponses[K]>, {}>
          : never
        : never;
    }[keyof TResponses]
  : never;

type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];
type NotNever<T> = [T] extends [never] ? false : true;

export type ApiQueryOptions = {
  /** Override whether a generated TanStack Query consumes TanStack Query's AbortSignal. */
  consumeQuerySignal?: boolean;
};

/** Call options merged onto inferred endpoint parameters. */
type ApiRequestOptions = {
  overrides?: RequestInit;
  queryOptions?: ApiQueryOptions;
  withResponse?: boolean;
  throwOnStatusError?: boolean;
  validate?: ValidateSide;
};

/** Parameter bag for an endpoint + request options. */
export type ApiCallParams<TEndpoint> = TEndpoint extends { parameters: infer UParams }
  ? NotNever<InferSchemaInput<UParams>> extends true
    ? InferSchemaInput<UParams> & ApiRequestOptions
    : ApiRequestOptions
  : ApiRequestOptions;

/** Resolve response type from withResponse flag on the call config. */
export type ApiCallResult<TEndpoint, TParams> = TParams extends { withResponse: true }
  ? SafeApiResponse<TEndpoint>
  : InferSuccessData<TEndpoint>;

export type ValidateSide = "none" | "input" | "output" | "both";
export type OnValidate = (ctx: {
  side: "input" | "output";
  method: string;
  path: string;
  schema: unknown;
  value: unknown;
}) => unknown | Promise<unknown>;

// </ApiClientTypes>

// <TypedStatusError>
export class TypedStatusError<TData = unknown> extends Error {
  response: TypedErrorResponse<TData, ErrorStatusCode, unknown>;
  status: number;
  constructor(response: TypedErrorResponse<TData, ErrorStatusCode, unknown>) {
    super(`HTTP ${response.status}: ${response.statusText}`);
    this.name = "TypedStatusError";
    this.response = response;
    this.status = response.status;
  }
}
// </TypedStatusError>

// <ValidateHelpers>
const defaultParse = (schema: unknown, value: unknown): unknown => {
  return (schema as { parse: (v: unknown) => unknown }).parse(value);
};

const runValidate = async (ctx: {
  side: "input" | "output";
  method: string;
  path: string;
  schema: unknown;
  value: unknown;
  onValidate?: OnValidate;
}): Promise<unknown> => {
  if (ctx.onValidate) return ctx.onValidate(ctx);
  return defaultParse(ctx.schema, ctx.value);
};
// </ValidateHelpers>

// <ApiClient>
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export class ApiClient {
  baseUrl: string = "";
  successStatusCodes = successStatusCodes;
  errorStatusCodes = errorStatusCodes;
  validate: ValidateSide = "both";
  onValidate?: OnValidate;

  constructor(
    public fetcher: Fetcher,
    options?: { validate?: ValidateSide; onValidate?: OnValidate },
  ) {
    if (options?.validate !== undefined) this.validate = options.validate;
    if (options?.onValidate) this.onValidate = options.onValidate;
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  setValidate(validate: ValidateSide) {
    this.validate = validate;
    return this;
  }

  setOnValidate(onValidate: OnValidate | undefined) {
    if (onValidate === undefined) {
      delete this.onValidate;
    } else {
      this.onValidate = onValidate;
    }
    return this;
  }

  /**
   * Replace path parameters in URL
   * Supports both OpenAPI format {param} and Express format :param
   */
  defaultDecodePathParams = (url: string, params: unknown, styles?: Record<string, ParameterSerialization>): string => {
    const record = (params ?? {}) as Record<string, unknown>;
    const encode = (value: unknown) => encodeURIComponent(String(value));
    const serialize = (key: string, value: unknown): string => {
      const parameterStyle = styles?.[key];
      const style = parameterStyle?.style ?? "simple";
      const explode = parameterStyle?.explode ?? false;
      if (style === "label") {
        if (Array.isArray(value))
          return (
            "." +
            value
              .filter((item) => item != null)
              .map(encode)
              .join(explode ? "." : ",")
          );
        if (isPlainObject(value)) {
          const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item != null);
          return (
            "." +
            (explode
              ? entries.map(([name, item]) => encode(name) + "=" + encode(item)).join(".")
              : entries.flatMap(([name, item]) => [encode(name), encode(item)]).join(","))
          );
        }
        return "." + encode(value);
      }
      if (style === "matrix") {
        if (Array.isArray(value))
          return explode
            ? value
                .filter((item) => item != null)
                .map((item) => ";" + key + "=" + encode(item))
                .join("")
            : ";" +
                key +
                "=" +
                value
                  .filter((item) => item != null)
                  .map(encode)
                  .join(",");
        if (isPlainObject(value)) {
          const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item != null);
          return explode
            ? entries.map(([name, item]) => ";" + encode(name) + "=" + encode(item)).join("")
            : ";" + key + "=" + entries.flatMap(([name, item]) => [encode(name), encode(item)]).join(",");
        }
        return ";" + key + "=" + encode(value);
      }
      if (Array.isArray(value))
        return value
          .filter((item) => item != null)
          .map(encode)
          .join(",");
      if (isPlainObject(value)) {
        return Object.entries(value as Record<string, unknown>)
          .filter(([, item]) => item != null)
          .map(([name, item]) => (explode ? encode(name) + "=" + encode(item) : [encode(name), encode(item)]))
          .flat()
          .join(",");
      }
      return encode(value);
    };
    return url
      .replace(/{([^}]+)}/g, (_, key: string) => (record[key] != null ? serialize(key, record[key]) : `{${key}}`))
      .replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) =>
        record[key] != null ? serialize(key, record[key]) : `:${key}`,
      );
  };

  /** Uses URLSearchParams, skips null/undefined values */
  defaultEncodeSearchParams = (
    queryParams: unknown,
    styles?: Record<string, ParameterSerialization>,
  ): URLSearchParams | undefined => {
    if (!queryParams || typeof queryParams !== "object") return;

    const searchParams = new URLSearchParams();
    const rawEntries: Array<{ key: string; value: string; allowReserved: boolean }> = [];
    const append = (key: string, value: unknown, allowReserved = false) => {
      const stringValue = String(value);
      searchParams.append(key, stringValue);
      rawEntries.push({ key, value: stringValue, allowReserved });
    };
    const encodeQueryComponent = (value: string, allowReserved: boolean) => {
      const encoded = encodeURIComponent(value);
      return allowReserved
        ? encoded.replace(/%3A|%2F|%3F|%40|%21|%24|%26|%27|%28|%29|%2A|%2B|%2C|%3B|%3D|%5B|%5D/gi, (part) =>
            decodeURIComponent(part),
          )
        : encoded;
    };
    Object.defineProperty(searchParams, "toString", {
      value: () =>
        rawEntries
          .map(
            ({ key, value, allowReserved }) =>
              `${encodeQueryComponent(key, false)}=${encodeQueryComponent(value, allowReserved)}`,
          )
          .join("&"),
    });
    Object.entries(queryParams as Record<string, unknown>).forEach(([key, value]) => {
      if (value != null) {
        // Skip null/undefined values
        const parameterStyle = styles?.[key];
        const style = parameterStyle?.style ?? "form";
        const explode = parameterStyle?.explode ?? true;
        const allowReserved = parameterStyle?.allowReserved === true;
        if (Array.isArray(value)) {
          if (style === "spaceDelimited")
            append(
              key,
              value
                .filter((item) => item != null)
                .map(String)
                .join(" "),
              allowReserved,
            );
          else if (style === "pipeDelimited")
            append(
              key,
              value
                .filter((item) => item != null)
                .map(String)
                .join("|"),
              allowReserved,
            );
          else if (explode) value.forEach((val) => val != null && append(key, val, allowReserved));
          else
            append(
              key,
              value
                .filter((item) => item != null)
                .map(String)
                .join(","),
              allowReserved,
            );
        } else if (isPlainObject(value)) {
          const entries = Object.entries(value as Record<string, unknown>).filter(
            ([, nestedValue]) => nestedValue != null,
          );
          if (style === "deepObject") {
            for (const [nestedKey, nestedValue] of entries) {
              if (Array.isArray(nestedValue))
                nestedValue.forEach((item) => item != null && append(`${key}[${nestedKey}]`, item, allowReserved));
              else append(`${key}[${nestedKey}]`, nestedValue, allowReserved);
            }
          } else if (explode) {
            for (const [nestedKey, nestedValue] of entries) {
              if (Array.isArray(nestedValue))
                nestedValue.forEach((item) => item != null && append(nestedKey, item, allowReserved));
              else append(nestedKey, nestedValue, allowReserved);
            }
          } else {
            append(
              key,
              entries
                .flatMap(([nestedKey, nestedValue]) => [
                  nestedKey,
                  ...(Array.isArray(nestedValue) ? nestedValue : [nestedValue]),
                ])
                .map(String)
                .join(","),
              allowReserved,
            );
          }
        } else {
          append(key, value, allowReserved);
        }
      }
    });

    return searchParams;
  };

  /** Append cookie params as a Cookie header (or merge into existing). */
  defaultEncodeCookies = (cookies: unknown, headers: Headers): void => {
    if (!cookies || typeof cookies !== "object") return;
    const parts = Object.entries(cookies as Record<string, unknown>)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}=${String(value)}`);
    if (!parts.length) return;
    const existing = headers.get("cookie");
    headers.set("cookie", existing ? `${existing}; ${parts.join("; ")}` : parts.join("; "));
  };

  defaultParseResponseData = async (response: FetcherResponse): Promise<unknown> => {
    const contentType = response.headers.get("content-type") ?? "";
    const normalizedContentType = contentType.toLowerCase();
    if (normalizedContentType.includes("text/event-stream")) {
      return response.body ?? null;
    }
    if (normalizedContentType.startsWith("text/")) {
      return await response.text();
    }

    if (normalizedContentType.startsWith("application/octet-stream")) {
      return new Blob([await response.arrayBuffer()]);
    }

    if (
      normalizedContentType.includes("application/json") ||
      (normalizedContentType.includes("application/") && normalizedContentType.includes("json")) ||
      normalizedContentType === "*/*"
    ) {
      try {
        return await response.json();
      } catch {
        return undefined;
      }
    }

    return;
  };

  // <ApiClient.post>
  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse: true;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<SafeApiResponse<TEndpoint>>;

  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: false;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<InferSuccessData<TEndpoint>>;

  post<Path extends keyof PostEndpoints>(path: Path, ...params: [config?: unknown]): Promise<unknown> {
    return this.request("post", path, params[0] as never) as Promise<unknown>;
  }
  // </ApiClient.post>

  // <ApiClient.get>
  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse: true;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<SafeApiResponse<TEndpoint>>;

  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: false;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<InferSuccessData<TEndpoint>>;

  get<Path extends keyof GetEndpoints>(path: Path, ...params: [config?: unknown]): Promise<unknown> {
    return this.request("get", path, params[0] as never) as Promise<unknown>;
  }
  // </ApiClient.get>

  // <ApiClient.patch>
  patch<Path extends keyof PatchEndpoints, TEndpoint extends PatchEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse: true;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<SafeApiResponse<TEndpoint>>;

  patch<Path extends keyof PatchEndpoints, TEndpoint extends PatchEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: false;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<InferSuccessData<TEndpoint>>;

  patch<Path extends keyof PatchEndpoints>(path: Path, ...params: [config?: unknown]): Promise<unknown> {
    return this.request("patch", path, params[0] as never) as Promise<unknown>;
  }
  // </ApiClient.patch>

  // <ApiClient.delete>
  delete<Path extends keyof DeleteEndpoints, TEndpoint extends DeleteEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse: true;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<SafeApiResponse<TEndpoint>>;

  delete<Path extends keyof DeleteEndpoints, TEndpoint extends DeleteEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: false;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<InferSuccessData<TEndpoint>>;

  delete<Path extends keyof DeleteEndpoints>(path: Path, ...params: [config?: unknown]): Promise<unknown> {
    return this.request("delete", path, params[0] as never) as Promise<unknown>;
  }
  // </ApiClient.delete>

  // <ApiClient.request>
  /**
   * Generic request method with full type-safety for any endpoint
   */
  request<
    TMethod extends keyof EndpointByMethod,
    TPath extends keyof EndpointByMethod[TMethod],
    TEndpoint extends EndpointByMethod[TMethod][TPath],
  >(
    method: TMethod,
    path: TPath,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse: true;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse: true;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<SafeApiResponse<TEndpoint>>;

  request<
    TMethod extends keyof EndpointByMethod,
    TPath extends keyof EndpointByMethod[TMethod],
    TEndpoint extends EndpointByMethod[TMethod][TPath],
  >(
    method: TMethod,
    path: TPath,
    ...params: MaybeOptionalArg<
      TEndpoint extends { parameters: infer UParams }
        ? NotNever<InferSchemaInput<UParams>> extends true
          ? InferSchemaInput<UParams> & {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
          : {
              overrides?: RequestInit;
              queryOptions?: ApiQueryOptions;
              withResponse?: false;
              throwOnStatusError?: boolean;
              validate?: ValidateSide;
            }
        : {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: false;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          }
    >
  ): Promise<InferSuccessData<TEndpoint>>;

  request<
    TMethod extends keyof EndpointByMethod,
    TPath extends keyof EndpointByMethod[TMethod],
    TEndpoint extends EndpointByMethod[TMethod][TPath],
  >(method: TMethod, path: TPath, ...params: [config?: unknown]): Promise<unknown> {
    return (async () => {
      const requestParams = params[0] as
        | (EndpointParameters & {
            overrides?: RequestInit;
            queryOptions?: ApiQueryOptions;
            withResponse?: boolean;
            throwOnStatusError?: boolean;
            validate?: ValidateSide;
          })
        | undefined;
      const withResponse = requestParams?.withResponse;
      const throwOnStatusError = requestParams?.throwOnStatusError ?? (withResponse ? false : true);
      let overrides = requestParams?.overrides;
      const validateSide: ValidateSide = requestParams?.validate ?? this.validate;

      const parametersToSend: EndpointParameters = {};
      if (requestParams?.body !== undefined) parametersToSend.body = requestParams.body;
      if (requestParams?.query !== undefined) parametersToSend.query = requestParams.query;
      if (requestParams?.header !== undefined) parametersToSend.header = requestParams.header;
      if (requestParams?.path !== undefined) parametersToSend.path = requestParams.path;
      if (requestParams?.cookie !== undefined) parametersToSend.cookie = requestParams.cookie;

      type RuntimeEndpoint = {
        parameters?: Partial<Record<"body" | "query" | "header" | "path" | "cookie", unknown>>;
        responses?: Record<string, unknown>;
      };
      const endpointSchema = EndpointByMethod[method][path] as RuntimeEndpoint;
      const shouldValidateInput = validateSide === "input" || validateSide === "both";
      if (shouldValidateInput && endpointSchema.parameters) {
        const paramSchema = endpointSchema.parameters;
        for (const key of ["body", "query", "header", "path", "cookie"] as const) {
          const schema = paramSchema[key];
          const value = parametersToSend[key];
          if (schema !== undefined && value !== undefined) {
            parametersToSend[key] = await runValidate({
              side: "input",
              method: String(method),
              path: String(path),
              schema,
              value,
              ...(this.onValidate ? { onValidate: this.onValidate } : {}),
            });
          }
        }
      }

      const resolvedPath = (this.fetcher.decodePathParams ?? this.defaultDecodePathParams)(
        this.baseUrl + (path as string),
        parametersToSend.path ?? {},
        endpointParameterStyles[method]?.[path]?.path,
      );
      const url = new URL(resolvedPath);
      const urlSearchParams = (this.fetcher.encodeSearchParams ?? this.defaultEncodeSearchParams)(
        parametersToSend.query,
        endpointParameterStyles[method]?.[path]?.query,
      );

      if (parametersToSend.cookie) {
        const headers = new Headers((overrides as RequestInit | undefined)?.headers);
        (this.fetcher.encodeCookies ?? this.defaultEncodeCookies)(parametersToSend.cookie, headers);
        overrides = { ...overrides, headers };
      }

      const parameterStyles = endpointParameterStyles[method]?.[path as string];
      const response = await this.fetcher.fetch({
        method: method,
        path: path as string,
        url,
        ...(urlSearchParams ? { urlSearchParams } : {}),
        ...(Object.keys(parametersToSend).length ? { parameters: parametersToSend } : {}),
        requestFormat: endpointRequestFormats[method]?.[path] ?? "json",
        ...(parameterStyles ? { parameterStyles } : {}),
        security: endpointSecurityRequirements[method]?.[path] ?? defaultSecurityRequirements,
        ...(overrides ? { overrides } : {}),
        throwOnStatusError,
      });
      const responseFormat = endpointResponseFormats[method]?.[path] ?? "json";
      let data =
        responseFormat === "sse"
          ? (response.body ?? null)
          : await (this.fetcher.parseResponseData ?? this.defaultParseResponseData)(response);
      const shouldValidateOutput = validateSide === "output" || validateSide === "both";
      if (
        shouldValidateOutput &&
        responseFormat !== "sse" &&
        (response.ok || !(errorStatusCodes as readonly number[]).includes(response.status)) &&
        endpointSchema?.responses
      ) {
        const responseSchema =
          endpointSchema.responses[String(response.status)] ??
          endpointSchema.responses[String(Math.floor(response.status / 100)) + "xx"] ??
          endpointSchema.responses[String(Math.floor(response.status / 100)) + "XX"] ??
          endpointSchema.responses["default"];
        if (responseSchema) {
          data = await runValidate({
            side: "output",
            method: String(method),
            path: String(path),
            schema: responseSchema,
            value: data,
            ...(this.onValidate ? { onValidate: this.onValidate } : {}),
          });
        }
      }
      const typedResponse = Object.assign(response, {
        data: data,
        json: () => Promise.resolve(data),
      }) as SafeApiResponse<TEndpoint>;

      if (throwOnStatusError && (errorStatusCodes as readonly number[]).includes(response.status)) {
        throw new TypedStatusError(typedResponse as TypedErrorResponse<unknown, ErrorStatusCode, unknown>);
      }

      return withResponse ? typedResponse : data;
    })();
  }
  // </ApiClient.request>
}

export function createApiClient(
  fetcher: Fetcher,
  baseUrl?: string,
  options?: { validate?: ValidateSide; onValidate?: OnValidate },
) {
  return new ApiClient(fetcher, options).setBaseUrl(baseUrl ?? "");
}

/**
 Example usage:
 const api = createApiClient((method, url, params) =>
   fetch(url, { method, body: JSON.stringify(params) }).then((res) => res.json()),
 );
 api.get("/users").then((users) => console.log(users));
 api.post("/users", { body: { name: "John" } }).then((user) => console.log(user));
 api.put("/users/:id", { path: { id: 1 }, body: { name: "John" } }).then((user) => console.log(user));

 // With error handling
 const result = await api.get("/users/{id}", { path: { id: "123" }, withResponse: true });
 if (result.ok) {
   // Access data directly
   const user = result.data;
   console.log(user);

   // Or use the json() method for compatibility
   const userFromJson = await result.json();
   console.log(userFromJson);
 } else {
   const error = result.data;
   console.error(`Error ${result.status}:`, error);
 }
*/

// </ApiClient>
