import { z } from 'zod';
import { fa } from '@/messages/fa';

export const OWNER_NAME_MAX_LENGTH = 120;
export const OWNER_EMAIL_MAX_LENGTH = 255;
export const OWNER_PHONE_MAX_LENGTH = 40;
export const OWNER_NOTES_MAX_LENGTH = 2000;

export const createOwnerSchema = z.object({
  name: z.string().trim().min(1, fa.owners.nameRequired).max(OWNER_NAME_MAX_LENGTH, fa.owners.nameTooLong(OWNER_NAME_MAX_LENGTH)),
  phone: z.string().trim().max(OWNER_PHONE_MAX_LENGTH, fa.owners.phoneTooLong(OWNER_PHONE_MAX_LENGTH)).optional().or(z.literal('')),
  email: z.string().trim().max(OWNER_EMAIL_MAX_LENGTH, fa.owners.emailTooLong(OWNER_EMAIL_MAX_LENGTH)).optional().or(z.literal('')),
  notes: z.string().trim().max(OWNER_NOTES_MAX_LENGTH, fa.owners.notesTooLong(OWNER_NOTES_MAX_LENGTH)).optional().or(z.literal('')),
});

export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
