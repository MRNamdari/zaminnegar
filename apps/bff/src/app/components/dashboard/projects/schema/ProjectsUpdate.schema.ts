import z from "zod";
import { createFormProject } from "./ProjectsCreate.schema";

export const updateFormProject = z.object({
    ...createFormProject.shape
})

export type UpdateFormProjectValues = z.infer<typeof updateFormProject>