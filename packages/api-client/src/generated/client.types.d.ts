export namespace Schemas {
  // <Schemas>
  export type CreateProjectDto = { name: string; description?: string };
  export type ProjectResponseDto = { id: string; name: string; description: string; createdAt: Date; updatedAt: Date };
  export type PaginatedResponseDto = {
    items: Array<Record<string, unknown>>;
    /**
     * Total number of matches across all pages
     */
    total: number;
    page: number;
    limit: number;
  };
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
    createdAt: Date;
    updatedAt: Date;
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
  export type ParcelStatus = "active" | "inactive";
  export type ParcelResponseDto = {
    id: string;
    projectId: string;
    regionId: string;
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
    blockOccupancyPct?: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  };
  export type RegionWithParcelsResponse = {
    id: string;
    projectId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: RegionStatus;
    createdAt: Date;
    updatedAt: Date;
    parcels: ParcelResponseDto;
  };
  export type BlockStatus = "active" | "inactive";
  export type CreateBlockDto = {
    projectId: string;
    regionId: string;
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
  export type PartialRegionResponseDto = Partial<{
    id: string;
    projectId: string;
    boundaryId: string;
    name: string;
    description: string;
    status: RegionStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;
  export type BlockResponseDto = {
    id: string;
    projectId: string;
    regionId: string;
    boundaryId: string;
    areaM2: number;
    parcelsCount?: number | null;
    region?: (PartialRegionResponseDto & (Record<string, unknown> | null)) | null;
    name: string;
    description: string;
    status: BlockStatus;
    createdAt: Date;
    updatedAt: Date;
  };
  export type UpdateBlockDto = Partial<{
    regionId: string;
    name: string;
    description: string;
    status: BlockStatus;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
  export type BlockWithParcelsResponse = {
    id: string;
    projectId: string;
    regionId: string;
    boundaryId: string;
    areaM2: number;
    parcelsCount?: number | null;
    region?: (PartialRegionResponseDto & (Record<string, unknown> | null)) | null;
    name: string;
    description: string;
    status: BlockStatus;
    createdAt: Date;
    updatedAt: Date;
    parcels: ParcelResponseDto;
  };
  export type CreateParcelDto = {
    projectId: string;
    regionId: string;
    /**
     * Must belong to regionId
     */
    blockId?: string | null;
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
  export type UpdateParcelDto = Partial<{
    regionId: string;
    /**
     * Must belong to regionId
     */
    blockId: string | null;
    name: string;
    status: ParcelStatus;
    /**
     * GeoJSON MultiPolygon, WGS 84, [longitude, latitude]
     */
    geometry: Partial<{ type: "MultiPolygon" | "Polygon"; coordinates: Array<Array<Array<Array<number>>>> }>;
  }>;
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
  export type get_RegionController_listParcels = {
    method: "GET";
    path: "/regions/{id}/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.RegionWithParcelsResponse> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft
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
  export type get_BlockController_listParcels = {
    method: "GET";
    path: "/blocks/{id}/parcels";
    requestFormat: "json";
    responseFormat: "json";
    parameters: {
      path: { id: string };
    };
    responses: { 200: Array<Schemas.BlockWithParcelsResponse> };
  };
  /**
   * Send geometry, or the boundaryId of a finished draft
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
    "/projects": Endpoints.post_ProjectController_create;
    "/boundaries": Endpoints.post_BoundaryController_create;
    "/regions": Endpoints.post_RegionController_create;
    "/blocks": Endpoints.post_BlockController_create;
    "/parcels": Endpoints.post_ParcelController_create;
    "/parcels/{id}/owners": Endpoints.post_ParcelController_assignOwner;
    "/owners": Endpoints.post_OwnerController_create;
  };
  get: {
    "/projects": Endpoints.get_ProjectController_list;
    "/projects/{id}": Endpoints.get_ProjectController_get;
    "/boundaries": Endpoints.get_BoundaryController_list;
    "/boundaries/{id}": Endpoints.get_BoundaryController_get;
    "/regions": Endpoints.get_RegionController_list;
    "/regions/{id}": Endpoints.get_RegionController_get;
    "/regions/{id}/parcels": Endpoints.get_RegionController_listParcels;
    "/blocks": Endpoints.get_BlockController_list;
    "/blocks/{id}": Endpoints.get_BlockController_get;
    "/blocks/{id}/parcels": Endpoints.get_BlockController_listParcels;
    "/parcels": Endpoints.get_ParcelController_list;
    "/parcels/{id}": Endpoints.get_ParcelController_get;
    "/parcels/{id}/owners": Endpoints.get_ParcelController_listOwners;
    "/owners": Endpoints.get_OwnerController_list;
    "/owners/{id}": Endpoints.get_OwnerController_get;
    "/owners/{id}/parcels": Endpoints.get_OwnerController_listParcels;
  };
  patch: {
    "/projects/{id}": Endpoints.patch_ProjectController_update;
    "/boundaries/{id}": Endpoints.patch_BoundaryController_update;
    "/regions/{id}": Endpoints.patch_RegionController_update;
    "/blocks/{id}": Endpoints.patch_BlockController_update;
    "/parcels/{id}": Endpoints.patch_ParcelController_update;
    "/parcels/{id}/owners/{ownerId}": Endpoints.patch_ParcelController_updateOwnership;
    "/owners/{id}": Endpoints.patch_OwnerController_update;
  };
  delete: {
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
