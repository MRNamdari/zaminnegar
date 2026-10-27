import type { ParcelDto, UpdateParcelDto } from '@zaminnegar/api-client';

/** Applies a PATCH body to a cached parcel (used for instant, optimistic previews). */
export function applyParcelPatch(parcel: ParcelDto, patch: UpdateParcelDto): ParcelDto {
  const defined = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
  return { ...parcel, ...defined };
}
