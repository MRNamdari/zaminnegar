import { z } from 'zod';
import { fa } from '@/messages/fa';

export const PARCEL_NAME_MAX_LENGTH = 120;
export const PARCEL_NOTES_MAX_LENGTH = 5000;
export const STROKE_WIDTH_RANGE = { min: 0.5, max: 10 } as const;

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

/** Editable, non-geometric properties of a parcel. */
export const parcelPropertiesSchema = z.object({
  name: z.string().trim().min(1, fa.properties.nameRequired).max(PARCEL_NAME_MAX_LENGTH, fa.properties.nameTooLong(PARCEL_NAME_MAX_LENGTH)),
  fillColor: hexColor,
  fillOpacity: z.number().min(0).max(1),
  strokeColor: hexColor,
  strokeWidth: z.number().min(STROKE_WIDTH_RANGE.min).max(STROKE_WIDTH_RANGE.max),
  notes: z.string().max(PARCEL_NOTES_MAX_LENGTH),
});

export type ParcelPropertiesInput = z.infer<typeof parcelPropertiesSchema>;
