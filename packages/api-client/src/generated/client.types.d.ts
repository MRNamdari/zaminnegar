export namespace Schemas {
  // <Schemas>
  export type ErrorResponseDto = {
    /**
     * Stable, machine-readable code
     */
    code: string;
    message: string;
    /**
     * Present on rate-limit errors (429): seconds until a retry can succeed
     */
    retryAfterSeconds?: number;
  };
  export type ValidationErrorResponseDto = {
    statusCode: number;
    /**
     * One message, or one per invalid property
     */
    message: string | Array<string>;
    error: string;
  };
  export type RegisterUserDto = {
    /**
     * Lower case letters, digits and "_"; not only digits. Case-insensitive.
     */
    username: string;
    password: string;
    /**
     * Iranian mobile number in any common format; stored and returned as E.164 (`+989123456789`)
     */
    phone: string;
    /**
     * Never verified and never used to sign in
     */
    email?: string;
  };
  export type OtpDispatchResponseDto = {
    /**
     * The code stops working at this time
     */
    expiresAt: Date;
    /**
     * A new code can be requested from this time
     */
    resendAvailableAt: Date;
  };
  export type VerifyRegistrationDto = {
    /**
     * Iranian mobile number in any common format; stored and returned as E.164 (`+989123456789`)
     */
    phone: string;
    code: string;
  };
  export type LoginDto = {
    /**
     * Case-insensitive
     */
    username: string;
    password: string;
  };
  export type UserSummaryDto = { id: string; username: string; phone: string; email: string | null };
  export type SessionResponseDto = {
    user: UserSummaryDto;
    /**
     * The session ends here unless it is used before
     */
    idleExpiresAt: Date;
    /**
     * The session ends here no matter how active it is
     */
    absoluteExpiresAt: Date;
  };
  export type RoleSummaryDto = {
    id: string;
    name: string;
    /**
     * Predefined (seeded) role
     */
    isSystem: boolean;
  };
  export type Resource =
    | "project"
    | "boundary"
    | "region"
    | "block"
    | "parcel"
    | "owner"
    | "ownership"
    | "member"
    | "role"
    | "user";
  export type Action = "create" | "read" | "update" | "delete" | "invite" | "manage";
  export type PermissionDto = { resource: Resource; action: Action };
  export type CurrentMembershipDto = { projectId: string; role: RoleSummaryDto; permissions: Array<PermissionDto> };
  export type CurrentUserResponseDto = {
    id: string;
    username: string;
    phone: string;
    email: string | null;
    systemRole: (RoleSummaryDto & (Record<string, unknown> | null)) | null;
    /**
     * Granted on every project
     */
    systemPermissions: Array<PermissionDto>;
    memberships: Array<CurrentMembershipDto>;
  };
  export type ForgotPasswordDto = {
    /**
     * Username, or phone number in any common Iranian format (normalised to E.164)
     */
    identifier: string;
  };
  export type ResetPasswordDto = {
    /**
     * The same username or phone number that requested the code
     */
    identifier: string;
    code: string;
    newPassword: string;
  };
  export type PaginatedResponseDto = {
    items: Array<Record<string, unknown>>;
    /**
     * Total number of matches across all pages
     */
    total: number;
    page: number;
    limit: number;
  };
  export type UserResponseDto = {
    id: string;
    username: string;
    phone: string | null;
    /**
     * Null until registration is finished
     */
    phoneVerifiedAt: Date | null;
    email: string | null;
    isActive: boolean;
    systemRoleId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  export type UpdateUserDto = Partial<{
    /**
     * Deactivating an account also ends its session
     */
    isActive: boolean;
    /**
     * A system role, or null to remove it
     */
    systemRoleId: string | null;
  }>;
  export type PermissionDefinitionResponseDto = {
    resource: Resource;
    action: Action;
    description: string;
    /**
     * False when only a system role may hold the permission
     */
    projectAssignable: boolean;
  };
  export type RoleScope = "system" | "project";
  export type RoleResponseDto = {
    id: string;
    name: string;
    description: string;
    scope: RoleScope;
    /**
     * Predefined (seeded) roles cannot be changed or deleted
     */
    isSystem: boolean;
    /**
     * The project a custom role belongs to; null for predefined roles
     */
    projectId: string | null;
    permissions: Array<PermissionDto>;
    createdAt: Date;
    updatedAt: Date;
  };
  export type CreateRoleDto = {
    name: string;
    description?: string;
    /**
     * Only permissions a project role may hold, and only ones you hold yourself
     */
    permissions: Array<PermissionDto>;
  };
  export type UpdateRoleDto = Partial<{
    name: string;
    description: string;
    /**
     * Replaces the whole permission set
     */
    permissions: Array<PermissionDto>;
  }>;
  export type MemberResponseDto = {
    projectId: string;
    userId: string;
    username: string;
    /**
     * Present only for yourself and for callers with system-level access
     */
    phone?: string;
    /**
     * Present only for yourself and for callers with system-level access
     */
    email?: string | null;
    roleId: string;
    roleName: string;
    roleIsSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  export type AddMemberDto = {
    /**
     * Username of an active, phone-verified account
     */
    username: string;
    /**
     * A predefined project role or a custom role of this project
     */
    roleId: string;
  };
  export type UpdateMemberDto = {
    /**
     * A predefined project role or a custom role of this project
     */
    roleId: string;
  };
  export type CreateProjectDto = { name: string; description?: string };
  export type ProjectResponseDto = { id: string; name: string; description: string; createdAt: Date; updatedAt: Date };
  export type UpdateProjectDto = Partial<{ name: string; description: string }>;
  export type CreateBoundaryDto = {
    projectId: string;
    name: string;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  };
  export type BoundaryResponseDto = {
    id: string;
    projectId: string;
    name: string;
    geometry: Record<string, unknown>;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    createdAt: Date;
    updatedAt: Date;
  };
  export type UpdateBoundaryDto = Partial<{
    name: string;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
  export type RegionStatus = "active" | "inactive";
  export type CreateRegionDto = {
    projectId: string;
    name: string;
    description?: string;
    status?: RegionStatus;
    /**
     * Existing draft boundary to use instead of geometry
     */
    boundaryId?: string;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry?: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  };
  export type RegionResponseDto = {
    id: string;
    projectId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: RegionStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of blocks in the region. Only present in list responses
     */
    blocksCount?: number;
    /**
     * Number of parcels in the region. Only present in list responses
     */
    parcelsCount?: number;
  };
  export type BlockStatus = "active" | "inactive";
  export type BlockResponseDto = {
    id: string;
    projectId: string;
    /**
     * Derived from the block outline by the database
     */
    regionId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: BlockStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of parcels in the block. Only present in list responses
     */
    parcelsCount?: number;
    region?: RegionResponseDto;
  };
  export type ParcelStatus = "active" | "inactive";
  export type ParcelResponseDto = {
    id: string;
    projectId: string;
    /**
     * Derived from the parcel outline by the database
     */
    regionId: string;
    /**
     * Derived from the parcel outline by the database; null when no block contains the parcel
     */
    blockId?: string | null;
    boundaryId: string;
    name: string;
    status: ParcelStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    /**
     * % of the region this parcel occupies
     */
    regionOccupancyPct: number;
    /**
     * % of the block this parcel occupies
     */
    blockOccupancyPct?: number | null;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of owners holding a share. Only present in list responses
     */
    ownershipsCount?: number;
    region?: RegionResponseDto;
    /**
     * Only present in list responses; null when the parcel is in no block
     */
    block?: (BlockResponseDto & (Record<string, unknown> | null)) | null;
  };
  export type RegionDetailResponseDto = {
    id: string;
    projectId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: RegionStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of blocks in the region. Only present in list responses
     */
    blocksCount?: number;
    /**
     * Number of parcels in the region. Only present in list responses
     */
    parcelsCount?: number;
    project: ProjectResponseDto;
    boundary: BoundaryResponseDto;
    blocks: Array<BlockResponseDto>;
    parcels: Array<ParcelResponseDto>;
  };
  export type UpdateRegionDto = Partial<{
    name: string;
    description: string;
    status: RegionStatus;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
  export type CreateBlockDto = {
    projectId: string;
    name: string;
    description?: string;
    status?: BlockStatus;
    /**
     * Existing draft boundary to use instead of geometry
     */
    boundaryId?: string;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry?: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  };
  export type BlockDetailResponseDto = {
    id: string;
    projectId: string;
    /**
     * Derived from the block outline by the database
     */
    regionId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: BlockStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of parcels in the block. Only present in list responses
     */
    parcelsCount?: number;
    project: ProjectResponseDto;
    region: RegionResponseDto;
    boundary: BoundaryResponseDto;
    parcels: Array<ParcelResponseDto>;
  };
  export type UpdateBlockDto = Partial<{
    name: string;
    description: string;
    status: BlockStatus;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
  export type CreateParcelDto = {
    projectId: string;
    name: string;
    status?: ParcelStatus;
    /**
     * Existing draft boundary to use instead of geometry
     */
    boundaryId?: string;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry?: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  };
  export type OwnerResponseDto = {
    id: string;
    projectId: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    nationalId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  export type OwnershipWithOwnerResponseDto = {
    parcelId: string;
    ownerId: string;
    sharePct: number;
    createdAt: Date;
    updatedAt: Date;
    owner: OwnerResponseDto;
  };
  export type ParcelDetailResponseDto = {
    id: string;
    projectId: string;
    /**
     * Derived from the parcel outline by the database
     */
    regionId: string;
    /**
     * Derived from the parcel outline by the database; null when no block contains the parcel
     */
    blockId?: string | null;
    boundaryId: string;
    name: string;
    status: ParcelStatus;
    /**
     * Geodesic area in square meters
     */
    areaM2: number;
    /**
     * % of the region this parcel occupies
     */
    regionOccupancyPct: number;
    /**
     * % of the block this parcel occupies
     */
    blockOccupancyPct?: number | null;
    createdAt: Date;
    updatedAt: Date;
    /**
     * Number of owners holding a share. Only present in list responses
     */
    ownershipsCount?: number;
    project: ProjectResponseDto;
    region: RegionResponseDto;
    block: (BlockResponseDto & (Record<string, unknown> | null)) | null;
    boundary: BoundaryResponseDto;
    ownerships: Array<OwnershipWithOwnerResponseDto>;
  };
  export type UpdateParcelDto = Partial<{
    name: string;
    status: ParcelStatus;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
  export type AssignOwnerDto = {
    /**
     * Must belong to the same project as the parcel
     */
    ownerId: string;
    /**
     * Percent of the parcel; all shares of a parcel sum to ≤ 100
     */
    sharePct: number;
  };
  export type OwnershipResponseDto = {
    parcelId: string;
    ownerId: string;
    sharePct: number;
    createdAt: Date;
    updatedAt: Date;
  };
  export type UpdateOwnershipDto = {
    /**
     * Percent of the parcel; all shares of a parcel sum to ≤ 100
     */
    sharePct: number;
  };
  export type CreateOwnerDto = {
    projectId: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    nationalId: string;
    status: "active" | "inactive" | "pending";
  };
  export type UpdateOwnerDto = Partial<{
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    nationalId: string;
    status: "active" | "inactive" | "pending";
  }>;
  export type OwnershipWithParcelResponseDto = {
    parcelId: string;
    ownerId: string;
    sharePct: number;
    createdAt: Date;
    updatedAt: Date;
    parcel: ParcelResponseDto;
  };

  // </Schemas>
}

export namespace Endpoints {
  // <Endpoints>

  /**
   * Sends a verification code to the phone number. The answer is the same whether or not the username or phone is already registered.
   */
  export type post_AuthController_register = {
    method: "POST";
    path: "/auth/register";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.RegisterUserDto;
    };
    responses: {
      202: Schemas.OtpDispatchResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      429: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Activates the account; sign in afterwards.
   */
  export type post_AuthController_verifyRegistration = {
    method: "POST";
    path: "/auth/register/verify";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.VerifyRegistrationDto;
    };
    responses: {
      204: unknown;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      429: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Sets the session cookie and ends any previous session of this account.
   */
  export type post_AuthController_login = {
    method: "POST";
    path: "/auth/login";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.LoginDto;
    };
    responses: {
      200: Schemas.SessionResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
    };
    responseHeaders: { 200: { "Set-Cookie": string } };
  };
  export type post_AuthController_logout = {
    method: "POST";
    path: "/auth/logout";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 204: unknown; 401: Schemas.ErrorResponseDto; 403: Schemas.ErrorResponseDto };
  };
  /**
   * Issues a new session identifier and restarts the idle timer. The absolute deadline does not move.
   */
  export type post_AuthController_renew = {
    method: "POST";
    path: "/auth/session/renew";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 200: Schemas.SessionResponseDto; 401: Schemas.ErrorResponseDto; 403: Schemas.ErrorResponseDto };
    responseHeaders: { 200: { "Set-Cookie": string } };
  };
  export type get_AuthController_me = {
    method: "GET";
    path: "/auth/me";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 200: Schemas.CurrentUserResponseDto; 401: Schemas.ErrorResponseDto; 403: Schemas.ErrorResponseDto };
  };
  /**
   * Sends a code to the phone of the account. The answer is the same whether or not the account exists.
   */
  export type post_AuthController_forgotPassword = {
    method: "POST";
    path: "/auth/password/forgot";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.ForgotPasswordDto;
    };
    responses: {
      202: Schemas.OtpDispatchResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      429: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Ends the account's session. Sign in with the new password afterwards.
   */
  export type post_AuthController_resetPassword = {
    method: "POST";
    path: "/auth/password/reset";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.ResetPasswordDto;
    };
    responses: {
      204: unknown;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      429: Schemas.ErrorResponseDto;
    };
  };
  export type get_UsersController_list = {
    method: "GET";
    path: "/users";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; search: string }>;
    };
    responses: {
      200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.UserResponseDto> }>;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Your own account, or any account with the system-level `user:read` permission.
   */
  export type get_UsersController_get = {
    method: "GET";
    path: "/users/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: {
      200: Schemas.UserResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Deactivating an account ends its session. You cannot grant a system role stronger than your own.
   */
  export type patch_UsersController_update = {
    method: "PATCH";
    path: "/users/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateUserDto;
    };
    responses: {
      200: Schemas.UserResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
    };
  };
  export type get_PermissionsController_list = {
    method: "GET";
    path: "/permissions";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: {
      200: Array<Schemas.PermissionDefinitionResponseDto>;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
    };
  };
  export type get_SystemRolesController_list = {
    method: "GET";
    path: "/roles/system";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 200: Array<Schemas.RoleResponseDto>; 401: Schemas.ErrorResponseDto; 403: Schemas.ErrorResponseDto };
  };
  export type get_ProjectRolesController_list = {
    method: "GET";
    path: "/projects/{projectId}/roles";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };
    };
    responses: {
      200: Array<Schemas.RoleResponseDto>;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
    };
  };
  /**
   * The role belongs to this project only. It can hold only permissions that you hold in this project yourself.
   */
  export type post_ProjectRolesController_create = {
    method: "POST";
    path: "/projects/{projectId}/roles";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };

      body: Schemas.CreateRoleDto;
    };
    responses: {
      201: Schemas.RoleResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
      422: Schemas.ErrorResponseDto;
    };
  };
  export type get_ProjectRolesController_get = {
    method: "GET";
    path: "/projects/{projectId}/roles/{roleId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; roleId: string };
    };
    responses: {
      200: Schemas.RoleResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Predefined roles cannot be changed. Changes apply to its members immediately.
   */
  export type patch_ProjectRolesController_update = {
    method: "PATCH";
    path: "/projects/{projectId}/roles/{roleId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; roleId: string };

      body: Schemas.UpdateRoleDto;
    };
    responses: {
      200: Schemas.RoleResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
      422: Schemas.ErrorResponseDto;
    };
  };
  export type delete_ProjectRolesController_remove = {
    method: "DELETE";
    path: "/projects/{projectId}/roles/{roleId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; roleId: string };
    };
    responses: {
      204: unknown;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
    };
  };
  /**
   * Contact details are included only for yourself and for system-level callers.
   */
  export type get_ProjectMembersController_list = {
    method: "GET";
    path: "/projects/{projectId}/members";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };
    };
    responses: {
      200: Array<Schemas.MemberResponseDto>;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
    };
  };
  /**
   * You can assign only roles whose permissions you hold in this project yourself.
   */
  export type post_ProjectMembersController_add = {
    method: "POST";
    path: "/projects/{projectId}/members";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };

      body: Schemas.AddMemberDto;
    };
    responses: {
      201: Schemas.MemberResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
    };
  };
  /**
   * You can neither assign a role stronger than your own nor change a member who holds one. The last owner cannot be demoted.
   */
  export type patch_ProjectMembersController_changeRole = {
    method: "PATCH";
    path: "/projects/{projectId}/members/{userId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; userId: string };

      body: Schemas.UpdateMemberDto;
    };
    responses: {
      200: Schemas.MemberResponseDto;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
    };
  };
  export type delete_ProjectMembersController_remove = {
    method: "DELETE";
    path: "/projects/{projectId}/members/{userId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; userId: string };
    };
    responses: {
      204: unknown;
      400: Schemas.ValidationErrorResponseDto | Schemas.ErrorResponseDto;
      401: Schemas.ErrorResponseDto;
      403: Schemas.ErrorResponseDto;
      404: Schemas.ErrorResponseDto;
      409: Schemas.ErrorResponseDto;
    };
  };
  export type post_ProjectController_create = {
    method: "POST";
    path: "/projects";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateProjectDto;
    };
    responses: { 201: Schemas.ProjectResponseDto };
  };
  export type get_ProjectController_list = {
    method: "GET";
    path: "/projects";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; search: string }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.ProjectResponseDto> }> };
  };
  export type get_ProjectController_get = {
    method: "GET";
    path: "/projects/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.ProjectResponseDto };
  };
  export type patch_ProjectController_update = {
    method: "PATCH";
    path: "/projects/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateProjectDto;
    };
    responses: { 200: Schemas.ProjectResponseDto };
  };
  export type delete_ProjectController_remove = {
    method: "DELETE";
    path: "/projects/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  /**
   * Creates a draft boundary; it becomes a region, block or parcel outline when one is created with its boundaryId
   */
  export type post_BoundaryController_create = {
    method: "POST";
    path: "/boundaries";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateBoundaryDto;
    };
    responses: { 201: Schemas.BoundaryResponseDto };
  };
  export type get_BoundaryController_list = {
    method: "GET";
    path: "/boundaries";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; projectId: string; search: string }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.BoundaryResponseDto> }> };
  };
  export type get_BoundaryController_get = {
    method: "GET";
    path: "/boundaries/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.BoundaryResponseDto };
  };
  export type patch_BoundaryController_update = {
    method: "PATCH";
    path: "/boundaries/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateBoundaryDto;
    };
    responses: { 200: Schemas.BoundaryResponseDto };
  };
  export type delete_BoundaryController_remove = {
    method: "DELETE";
    path: "/boundaries/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft
   */
  export type post_RegionController_create = {
    method: "POST";
    path: "/regions";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateRegionDto;
    };
    responses: { 201: Schemas.RegionResponseDto };
  };
  /**
   * Each region carries the number of blocks and parcels it contains
   */
  export type get_RegionController_list = {
    method: "GET";
    path: "/regions";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; projectId: string; status: Schemas.RegionStatus; search: string }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.RegionResponseDto> }> };
  };
  export type get_RegionController_get = {
    method: "GET";
    path: "/regions/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.RegionResponseDto };
  };
  export type patch_RegionController_update = {
    method: "PATCH";
    path: "/regions/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateRegionDto;
    };
    responses: { 200: Schemas.RegionResponseDto };
  };
  export type delete_RegionController_remove = {
    method: "DELETE";
    path: "/regions/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_RegionController_getDetail = {
    method: "GET";
    path: "/regions/{id}/detail";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.RegionDetailResponseDto };
  };
  export type get_RegionController_listParcels = {
    method: "GET";
    path: "/regions/{id}/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.ParcelResponseDto> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft. The region is not sent: it is the region of the project that contains the block outline.
   */
  export type post_BlockController_create = {
    method: "POST";
    path: "/blocks";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateBlockDto;
    };
    responses: { 201: Schemas.BlockResponseDto };
  };
  /**
   * Each block carries its region and the number of parcels it contains
   */
  export type get_BlockController_list = {
    method: "GET";
    path: "/blocks";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{
        page: number;
        limit: number;
        projectId: string;
        regionId: string;
        status: Schemas.BlockStatus;
        search: string;
      }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.BlockResponseDto> }> };
  };
  export type get_BlockController_get = {
    method: "GET";
    path: "/blocks/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.BlockResponseDto };
  };
  export type patch_BlockController_update = {
    method: "PATCH";
    path: "/blocks/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateBlockDto;
    };
    responses: { 200: Schemas.BlockResponseDto };
  };
  export type delete_BlockController_remove = {
    method: "DELETE";
    path: "/blocks/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_BlockController_getDetail = {
    method: "GET";
    path: "/blocks/{id}/detail";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.BlockDetailResponseDto };
  };
  export type get_BlockController_listParcels = {
    method: "GET";
    path: "/blocks/{id}/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.ParcelResponseDto> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft. Region and block are not sent: they are the region and block that contain the parcel outline.
   */
  export type post_ParcelController_create = {
    method: "POST";
    path: "/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateParcelDto;
    };
    responses: { 201: Schemas.ParcelResponseDto };
  };
  /**
   * Each parcel carries its region, its block (or null) and the number of owners holding a share
   */
  export type get_ParcelController_list = {
    method: "GET";
    path: "/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{
        page: number;
        limit: number;
        projectId: string;
        regionId: string;
        blockId: string;
        status: Schemas.ParcelStatus;
        search: string;
      }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.ParcelResponseDto> }> };
  };
  export type get_ParcelController_get = {
    method: "GET";
    path: "/parcels/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.ParcelResponseDto };
  };
  export type patch_ParcelController_update = {
    method: "PATCH";
    path: "/parcels/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateParcelDto;
    };
    responses: { 200: Schemas.ParcelResponseDto };
  };
  export type delete_ParcelController_remove = {
    method: "DELETE";
    path: "/parcels/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_ParcelController_getDetail = {
    method: "GET";
    path: "/parcels/{id}/detail";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.ParcelDetailResponseDto };
  };
  export type get_ParcelController_listOwners = {
    method: "GET";
    path: "/parcels/{id}/owners";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.OwnershipWithOwnerResponseDto> };
  };
  export type post_ParcelController_assignOwner = {
    method: "POST";
    path: "/parcels/{id}/owners";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.AssignOwnerDto;
    };
    responses: { 201: Schemas.OwnershipResponseDto };
  };
  export type patch_ParcelController_updateOwnership = {
    method: "PATCH";
    path: "/parcels/{id}/owners/{ownerId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string; ownerId: string };

      body: Schemas.UpdateOwnershipDto;
    };
    responses: { 200: Schemas.OwnershipResponseDto };
  };
  export type delete_ParcelController_removeOwner = {
    method: "DELETE";
    path: "/parcels/{id}/owners/{ownerId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string; ownerId: string };
    };
    responses: { 204: unknown };
  };
  export type post_OwnerController_create = {
    method: "POST";
    path: "/owners";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateOwnerDto;
    };
    responses: { 201: Schemas.OwnerResponseDto };
  };
  export type get_OwnerController_list = {
    method: "GET";
    path: "/owners";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; projectId: string; search: string }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.OwnerResponseDto> }> };
  };
  export type get_OwnerController_get = {
    method: "GET";
    path: "/owners/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.OwnerResponseDto };
  };
  export type patch_OwnerController_update = {
    method: "PATCH";
    path: "/owners/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateOwnerDto;
    };
    responses: { 200: Schemas.OwnerResponseDto };
  };
  export type delete_OwnerController_remove = {
    method: "DELETE";
    path: "/owners/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_OwnerController_listParcels = {
    method: "GET";
    path: "/owners/{id}/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.OwnershipWithParcelResponseDto> };
  };

  // </Endpoints>
}

// <EndpointByMethod>
export type EndpointByMethod = {
  post: {
    "/auth/register": Endpoints.post_AuthController_register;
    "/auth/register/verify": Endpoints.post_AuthController_verifyRegistration;
    "/auth/login": Endpoints.post_AuthController_login;
    "/auth/logout": Endpoints.post_AuthController_logout;
    "/auth/session/renew": Endpoints.post_AuthController_renew;
    "/auth/password/forgot": Endpoints.post_AuthController_forgotPassword;
    "/auth/password/reset": Endpoints.post_AuthController_resetPassword;
    "/projects/{projectId}/roles": Endpoints.post_ProjectRolesController_create;
    "/projects/{projectId}/members": Endpoints.post_ProjectMembersController_add;
    "/projects": Endpoints.post_ProjectController_create;
    "/boundaries": Endpoints.post_BoundaryController_create;
    "/regions": Endpoints.post_RegionController_create;
    "/blocks": Endpoints.post_BlockController_create;
    "/parcels": Endpoints.post_ParcelController_create;
    "/parcels/{id}/owners": Endpoints.post_ParcelController_assignOwner;
    "/owners": Endpoints.post_OwnerController_create;
  };
  get: {
    "/auth/me": Endpoints.get_AuthController_me;
    "/users": Endpoints.get_UsersController_list;
    "/users/{id}": Endpoints.get_UsersController_get;
    "/permissions": Endpoints.get_PermissionsController_list;
    "/roles/system": Endpoints.get_SystemRolesController_list;
    "/projects/{projectId}/roles": Endpoints.get_ProjectRolesController_list;
    "/projects/{projectId}/roles/{roleId}": Endpoints.get_ProjectRolesController_get;
    "/projects/{projectId}/members": Endpoints.get_ProjectMembersController_list;
    "/projects": Endpoints.get_ProjectController_list;
    "/projects/{id}": Endpoints.get_ProjectController_get;
    "/boundaries": Endpoints.get_BoundaryController_list;
    "/boundaries/{id}": Endpoints.get_BoundaryController_get;
    "/regions": Endpoints.get_RegionController_list;
    "/regions/{id}": Endpoints.get_RegionController_get;
    "/regions/{id}/detail": Endpoints.get_RegionController_getDetail;
    "/regions/{id}/parcels": Endpoints.get_RegionController_listParcels;
    "/blocks": Endpoints.get_BlockController_list;
    "/blocks/{id}": Endpoints.get_BlockController_get;
    "/blocks/{id}/detail": Endpoints.get_BlockController_getDetail;
    "/blocks/{id}/parcels": Endpoints.get_BlockController_listParcels;
    "/parcels": Endpoints.get_ParcelController_list;
    "/parcels/{id}": Endpoints.get_ParcelController_get;
    "/parcels/{id}/detail": Endpoints.get_ParcelController_getDetail;
    "/parcels/{id}/owners": Endpoints.get_ParcelController_listOwners;
    "/owners": Endpoints.get_OwnerController_list;
    "/owners/{id}": Endpoints.get_OwnerController_get;
    "/owners/{id}/parcels": Endpoints.get_OwnerController_listParcels;
  };
  patch: {
    "/users/{id}": Endpoints.patch_UsersController_update;
    "/projects/{projectId}/roles/{roleId}": Endpoints.patch_ProjectRolesController_update;
    "/projects/{projectId}/members/{userId}": Endpoints.patch_ProjectMembersController_changeRole;
    "/projects/{id}": Endpoints.patch_ProjectController_update;
    "/boundaries/{id}": Endpoints.patch_BoundaryController_update;
    "/regions/{id}": Endpoints.patch_RegionController_update;
    "/blocks/{id}": Endpoints.patch_BlockController_update;
    "/parcels/{id}": Endpoints.patch_ParcelController_update;
    "/parcels/{id}/owners/{ownerId}": Endpoints.patch_ParcelController_updateOwnership;
    "/owners/{id}": Endpoints.patch_OwnerController_update;
  };
  delete: {
    "/projects/{projectId}/roles/{roleId}": Endpoints.delete_ProjectRolesController_remove;
    "/projects/{projectId}/members/{userId}": Endpoints.delete_ProjectMembersController_remove;
    "/projects/{id}": Endpoints.delete_ProjectController_remove;
    "/boundaries/{id}": Endpoints.delete_BoundaryController_remove;
    "/regions/{id}": Endpoints.delete_RegionController_remove;
    "/blocks/{id}": Endpoints.delete_BlockController_remove;
    "/parcels/{id}": Endpoints.delete_ParcelController_remove;
    "/parcels/{id}/owners/{ownerId}": Endpoints.delete_ParcelController_removeOwner;
    "/owners/{id}": Endpoints.delete_OwnerController_remove;
  };
};

// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type PostEndpoints = EndpointByMethod["post"];
export type GetEndpoints = EndpointByMethod["get"];
export type PatchEndpoints = EndpointByMethod["patch"];
export type DeleteEndpoints = EndpointByMethod["delete"];
// </EndpointByMethod.Shorthands>
