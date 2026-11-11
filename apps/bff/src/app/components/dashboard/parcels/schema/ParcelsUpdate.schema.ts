
import z from 'zod';
import { createFormParcel } from './ParcelsCreate.schema';

export const updateFormParcel = createFormParcel;

export type UpdateParcelFormValues = z.infer<typeof updateFormParcel>;
