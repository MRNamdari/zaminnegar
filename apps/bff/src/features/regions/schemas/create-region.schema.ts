import { z } from 'zod';
import { fa } from '@/messages/fa';

export const REGION_NAME_MAX_LENGTH = 120;
export const REGION_DESCRIPTION_MAX_LENGTH = 2000;

export const createRegionSchema = z.object({
  name: z.string().trim().min(1, fa.regions.nameRequired).max(REGION_NAME_MAX_LENGTH, fa.regions.nameTooLong(REGION_NAME_MAX_LENGTH)),
  description: z.string().trim().max(REGION_DESCRIPTION_MAX_LENGTH, fa.regions.descriptionTooLong(REGION_DESCRIPTION_MAX_LENGTH)),
  territory: z
    .string()
    .trim()
    .refine((value) => {
      try {
        const parsed = JSON.parse(value) as { type?: unknown; coordinates?: unknown };
        return parsed.type === 'MultiPolygon' && Array.isArray(parsed.coordinates);
      } catch {
        return false;
      }
    }, fa.regions.territoryInvalid),
});

export type CreateRegionInput = z.infer<typeof createRegionSchema>;
