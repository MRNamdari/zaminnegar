import { z } from 'zod';
import { fa } from '@/messages/fa';

export const BLOCK_NAME_MAX_LENGTH = 120;
export const BLOCK_DESCRIPTION_MAX_LENGTH = 2000;

export const createBlockSchema = z.object({
  name: z.string().trim().min(1, fa.blocks.nameRequired).max(BLOCK_NAME_MAX_LENGTH, fa.blocks.nameTooLong(BLOCK_NAME_MAX_LENGTH)),
  description: z.string().trim().max(BLOCK_DESCRIPTION_MAX_LENGTH, fa.blocks.descriptionTooLong(BLOCK_DESCRIPTION_MAX_LENGTH)),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
