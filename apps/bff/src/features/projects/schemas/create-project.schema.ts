import { z } from 'zod';
import { fa } from '@/messages/fa';

export const PROJECT_NAME_MAX_LENGTH = 120;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 2000;

/** Validation shared by the create-project form and the server action. */
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, fa.projects.nameRequired).max(PROJECT_NAME_MAX_LENGTH, fa.projects.nameTooLong(PROJECT_NAME_MAX_LENGTH)),
  description: z.string().trim().max(PROJECT_DESCRIPTION_MAX_LENGTH),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
