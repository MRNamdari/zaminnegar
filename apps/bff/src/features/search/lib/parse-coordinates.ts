import type { Position } from '@/features/map/types';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** True when the text consists only of digits, separators and signs (i.e. the user meant coordinates). */
export const looksLikeCoordinates = (text: string): boolean => /^[\s\d.,،٫\-+۰-۹٠-٩]+$/.test(text);

/**
 * Parses `"lat, lon"` (Persian/Arabic digits and separators allowed) into `[lon, lat]`.
 * If the first number cannot be a latitude it is read as `"lon, lat"`.
 *
 * @returns The position, or `null` when the text is not a valid coordinate pair.
 */
export function parseCoordinates(input: string): Position | null {
  const text = input
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/٫/g, '.')
    .replace(/[،٬;]/g, ',');
  const match = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  let lat = Number(match[1]);
  let lon = Number(match[2]);
  if (Math.abs(lat) > 90 && Math.abs(lon) <= 90) [lat, lon] = [lon, lat];
  return Math.abs(lat) > 90 || Math.abs(lon) > 180 ? null : [lon, lat];
}
