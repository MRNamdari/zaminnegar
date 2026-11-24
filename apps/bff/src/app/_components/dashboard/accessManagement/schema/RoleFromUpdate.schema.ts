import z from 'zod';
import { createFormRole } from './RoleFormCreate.schema';

export const updateFormRole = z.object({
  ...createFormRole.shape,
});

export type UpdateFormRoleValue = z.infer<typeof updateFormRole>;
