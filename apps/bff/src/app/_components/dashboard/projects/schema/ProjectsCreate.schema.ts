
import { z } from "zod";

export const createFormProject = z.object({
  name: z
    .string()
    .min(3, "نام پروژه باید حداقل ۳ کاراکتر باشد")
    .max(50, "نام پروژه نباید بیشتر از ۵۰ کاراکتر باشد"),

  description: z
    .string()
    .max(500, "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد"),

  status: z.enum(["فعال", "غیر فعال", "در انتظار"]),
});

export type ProjectFormValue = z.infer<typeof createFormProject>;
