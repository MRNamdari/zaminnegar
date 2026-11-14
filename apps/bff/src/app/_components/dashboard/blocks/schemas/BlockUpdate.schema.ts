import { z } from "zod";
import { createFormBlock } from "./BlockCreate.schema";

export const updateFormBlock = z.object({
    ...createFormBlock.shape,
});

export type UpdateBlockFormValues = z.infer<typeof updateFormBlock>