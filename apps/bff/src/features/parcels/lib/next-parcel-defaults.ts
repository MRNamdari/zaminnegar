import type { ParcelDto } from '@zaminnegar/api-client';
import { fa } from '@/messages/fa';

/** Fill colors assigned to new parcels in rotation, so neighbours are easy to tell apart. */
export const PARCEL_PALETTE = ['#2F7D4F', '#E0A419', '#3B82C4', '#C2410C', '#7C3AED', '#0E9488', '#BE185D', '#65A30D'] as const;

/** First free default name ("قطعه ۱", "قطعه ۲", …); names are unique per project. */
export function nextParcelName(existing: readonly ParcelDto[]): string {
  const taken = new Set(existing.map((parcel) => parcel.name));
  let n = existing.length + 1;
  while (taken.has(fa.parcels.defaultName(n))) n += 1;
  return fa.parcels.defaultName(n);
}

/** Next palette color for a new parcel. */
export function nextParcelColor(existing: readonly ParcelDto[]): string {
  return PARCEL_PALETTE[existing.length % PARCEL_PALETTE.length];
}
