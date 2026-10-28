import { z } from 'zod';
import { fa } from '@/messages/fa';

export const assignParcelOwnerSchema = z.object({
  ownerId: z.string().trim().min(1, fa.owners.ownerRequired),
  share: z.number().min(0, fa.owners.shareMin).max(1, fa.owners.shareMax),
});

export type AssignParcelOwnerInput = z.infer<typeof assignParcelOwnerSchema>;
