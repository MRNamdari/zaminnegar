import z from "zod";
import { createFormOwner } from "./OwnersCreate.schema";

export const updateFormOwner = z.object({
  ...createFormOwner.shape,
});

export type UpdateOwnerFormValues = z.infer<typeof updateFormOwner>;