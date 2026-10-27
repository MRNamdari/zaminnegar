/** TanStack Query keys of the parcels feature. */
export const parcelKeys = {
  all: ['parcels'] as const,
  list: (projectId: string) => [...parcelKeys.all, 'list', projectId] as const,
  /** Prefix shared by every parcel mutation; used to derive the "saving" indicator. */
  mutations: ['parcels', 'mutation'] as const,
};
