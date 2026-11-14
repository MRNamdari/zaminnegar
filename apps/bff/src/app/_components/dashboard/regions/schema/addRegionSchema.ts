import z from "zod";

export const AddRegionSchema = z.object({
  name: z
    .string()
    .min(3, "نام باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام باید حداکثر ۵۰ کاراکتر داشته باشد"),
  description: z
    .string()
    .max(255, "توضیحات باید حداکثر ۵۰ کاراکتر داشته باشند"),
});

export type AddRegion = z.infer<typeof AddRegionSchema>;
