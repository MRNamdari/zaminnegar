export namespace Schemas {
  // <Schemas>
  export type LoginDto = { email: string; password: string };
  export type UserResponseDto = {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    /**
     * Role of scope `global`, if any
     */
    globalRoleId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  export type LoginResponseDto = {
    /**
     * Send as `Authorization: Bearer <token>`. Shown once.
     */
    token: string;
    expiresAt: Date;
    user: UserResponseDto;
  };
  export type RoleSummaryDto = { id: string; name: string };
  export type Resource =
    | "project"
    | "boundary"
    | "region"
    | "block"
    | "parcel"
    | "owner"
    | "ownership"
    | "member"
    | "user"
    | "role";
  export type Action = "create" | "read" | "update" | "delete";
  export type PermissionDto = { resource: Resource; action: Action };
  export type MembershipPermissionsDto = { projectId: string; role: RoleSummaryDto; permissions: Array<PermissionDto> };
  export type CurrentUserResponseDto = {
    id: string;
    email: string;
    name: string;
    globalRole: (RoleSummaryDto & (Record<string, unknown> | null)) | null;
    /**
     * Granted on every project
     */
    globalPermissions: Array<PermissionDto>;
    memberships: Array<MembershipPermissionsDto>;
  };
  export type CreateUserDto = {
    email: string;
    name: string;
    password: string;
    /**
     * A role of scope `global`
     */
    globalRoleId?: string | null;
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
  export type UpdateUserDto = Partial<{
    name: string;
    /**
     * Revokes all sessions of the user
     */
    password: string;
    /**
     * Deactivating a user revokes all sessions
     */
    isActive: boolean;
    /**
     * A role of scope `global`; null removes it
     */
    globalRoleId: string | null;
  }>;
  export type RoleScope = "global" | "project";
  export type RoleResponseDto = {
    id: string;
    name: string;
    description: string;
    scope: RoleScope;
    /**
     * System roles are seeded and cannot be changed or deleted
     */
    isSystem: boolean;
    permissions: Array<PermissionDto>;
    createdAt: Date;
    updatedAt: Date;
  };
  export type CreateRoleDto = {
    name: string;
    description?: string;
    scope: RoleScope;
    permissions: Array<PermissionDto>;
  };
  export type UpdateRoleDto = Partial<{ name: string; description: string; permissions: Array<PermissionDto> }>;
  export type MemberResponseDto = {
    projectId: string;
    userId: string;
    userEmail: string;
    userName: string;
    roleId: string;
    roleName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  export type AddMemberDto = {
    userId: string;
    /**
     * A role of scope `project`
     */
    roleId: string;
  };
  export type UpdateMemberDto = {
    /**
     * A role of scope `project`
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
    /**
     * Derived from the parcel outline by the database
     */
    regionId: string;
    /**
     * Derived from the parcel outline by the database; null when no block contains the parcel
     */
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
  export type BlockDetailResponseDto = {
    id: string;
    projectId: string;
    /**
     * Derived from the block outline by the database
     */
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
    status: "active" | "inactive" | "pending";
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
   * Returns an opaque session token to send as a Bearer token
   */
  export type post_AuthController_login = {
    method: "POST";
    path: "/auth/login";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      header: { "user-agent": string };

      body: Schemas.LoginDto;
    };
    responses: { 200: Schemas.LoginResponseDto };
  };
  export type post_AuthController_logout = {
    method: "POST";
    path: "/auth/logout";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 204: unknown };
  };
  export type get_AuthController_me = {
    method: "GET";
    path: "/auth/me";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 200: Schemas.CurrentUserResponseDto };
  };
  export type post_UsersController_create = {
    method: "POST";
    path: "/users";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateUserDto;
    };
    responses: { 201: Schemas.UserResponseDto };
  };
  export type get_UsersController_list = {
    method: "GET";
    path: "/users";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      query?: Partial<{ page: number; limit: number; search: string }>;
    };
    responses: { 200: Schemas.PaginatedResponseDto & Partial<{ items: Array<Schemas.UserResponseDto> }> };
  };
  export type get_UsersController_get = {
    method: "GET";
    path: "/users/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.UserResponseDto };
  };
  export type patch_UsersController_update = {
    method: "PATCH";
    path: "/users/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateUserDto;
    };
    responses: { 200: Schemas.UserResponseDto };
  };
  export type delete_UsersController_remove = {
    method: "DELETE";
    path: "/users/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_RolesController_list = {
    method: "GET";
    path: "/roles";
    requestFormat: "json";
    responseFormat: "json";
    parameters: never;
    responses: { 200: Array<Schemas.RoleResponseDto> };
  };
  export type post_RolesController_create = {
    method: "POST";
    path: "/roles";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      body: Schemas.CreateRoleDto;
    };
    responses: { 201: Schemas.RoleResponseDto };
  };
  export type get_RolesController_get = {
    method: "GET";
    path: "/roles/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Schemas.RoleResponseDto };
  };
  /**
   * System roles cannot be changed
   */
  export type patch_RolesController_update = {
    method: "PATCH";
    path: "/roles/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };

      body: Schemas.UpdateRoleDto;
    };
    responses: { 200: Schemas.RoleResponseDto };
  };
  /**
   * System roles and roles still assigned to someone cannot be deleted
   */
  export type delete_RolesController_remove = {
    method: "DELETE";
    path: "/roles/{id}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 204: unknown };
  };
  export type get_ProjectMembersController_list = {
    method: "GET";
    path: "/projects/{projectId}/members";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };
    };
    responses: { 200: Array<Schemas.MemberResponseDto> };
  };
  export type post_ProjectMembersController_add = {
    method: "POST";
    path: "/projects/{projectId}/members";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string };

      body: Schemas.AddMemberDto;
    };
    responses: { 201: Schemas.MemberResponseDto };
  };
  export type patch_ProjectMembersController_update = {
    method: "PATCH";
    path: "/projects/{projectId}/members/{userId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; userId: string };

      body: Schemas.UpdateMemberDto;
    };
    responses: { 200: Schemas.MemberResponseDto };
  };
  export type delete_ProjectMembersController_remove = {
    method: "DELETE";
    path: "/projects/{projectId}/members/{userId}";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { projectId: string; userId: string };
    };
    responses: { 204: unknown };
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
    responses: { 200: Array<Schemas.ParcelResponseDto> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft. The region is not sent: it is the region of the project that contains the block outline.
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
    responses: { 200: Array<Schemas.ParcelResponseDto> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft. Region and block are not sent: they are the region and block that contain the parcel outline.
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
    "/auth/login": Endpoints.post_AuthController_login;
    "/auth/logout": Endpoints.post_AuthController_logout;
    "/users": Endpoints.post_UsersController_create;
    "/roles": Endpoints.post_RolesController_create;
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
    "/roles": Endpoints.get_RolesController_list;
    "/roles/{id}": Endpoints.get_RolesController_get;
    "/projects/{projectId}/members": Endpoints.get_ProjectMembersController_list;
    "/projects": Endpoints.get_ProjectController_list;
    "/projects/{id}": Endpoints.get_ProjectController_get;
    "/boundaries": Endpoints.get_BoundaryController_list;
    "/boundaries/{id}": Endpoints.get_BoundaryController_get;
    "/regions": Endpoints.get_RegionController_list;
    "/regions/{id}": Endpoints.get_RegionController_get;
    "/regions/{id}/detail": Endpoints.get_RegionController_getDetail;
    "/regions/{id}/detail": Endpoints.get_RegionController_getDetail;
    "/regions/{id}/parcels": Endpoints.get_RegionController_listParcels;
    "/blocks": Endpoints.get_BlockController_list;
    "/blocks/{id}": Endpoints.get_BlockController_get;
    "/blocks/{id}/detail": Endpoints.get_BlockController_getDetail;
    "/blocks/{id}/detail": Endpoints.get_BlockController_getDetail;
    "/blocks/{id}/parcels": Endpoints.get_BlockController_listParcels;
    "/parcels": Endpoints.get_ParcelController_list;
    "/parcels/{id}": Endpoints.get_ParcelController_get;
    "/parcels/{id}/detail": Endpoints.get_ParcelController_getDetail;
    "/parcels/{id}/detail": Endpoints.get_ParcelController_getDetail;
    "/parcels/{id}/owners": Endpoints.get_ParcelController_listOwners;
    "/owners": Endpoints.get_OwnerController_list;
    "/owners/{id}": Endpoints.get_OwnerController_get;
    "/owners/{id}/parcels": Endpoints.get_OwnerController_listParcels;
  };
  patch: {
    "/users/{id}": Endpoints.patch_UsersController_update;
    "/roles/{id}": Endpoints.patch_RolesController_update;
    "/projects/{projectId}/members/{userId}": Endpoints.patch_ProjectMembersController_update;
    "/projects/{id}": Endpoints.patch_ProjectController_update;
    "/boundaries/{id}": Endpoints.patch_BoundaryController_update;
    "/regions/{id}": Endpoints.patch_RegionController_update;
    "/blocks/{id}": Endpoints.patch_BlockController_update;
    "/parcels/{id}": Endpoints.patch_ParcelController_update;
    "/parcels/{id}/owners/{ownerId}": Endpoints.patch_ParcelController_updateOwnership;
    "/owners/{id}": Endpoints.patch_OwnerController_update;
  };
  delete: {
    "/users/{id}": Endpoints.delete_UsersController_remove;
    "/roles/{id}": Endpoints.delete_RolesController_remove;
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
