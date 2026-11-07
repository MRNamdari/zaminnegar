import z from "zod";
import { AddRegionSchema } from "./addRegionSchema";

export const updateformRegion = z.object({
    ...AddRegionSchema.shape,
})

export type UpdateRegionFormValues = z.infer<typeof updateformRegion>