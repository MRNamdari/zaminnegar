import { z } from "zod";
import { createFormParcel } from "./ParcelsCreate.schema";

export const updateFormParcel = z.object({
    ...createFormParcel.shape,
});

export type UpdateParcelFormValues = z.infer<typeof updateFormParcel>