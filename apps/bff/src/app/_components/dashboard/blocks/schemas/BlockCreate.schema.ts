import { z } from "zod";

export const createFormBlock = z.object({
  blockCode: z
    .string()
    .min(3, "نام بلوک باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام بلوک باید حداکثر ۵۰ کاراکتر داشته باشد"),

  blockAreaName: z.enum(
    ["شمال", "جنوب", "شرق", "غرب", "مرکز"],
    {
      error: "لطفاً یک منطقه معتبر انتخاب کنید",
    }
  ),

  blockStatus: z.enum(["نهایی", "پیشنهادیه", "پیش‌نویس"]),
});

export type BlockFormValue = z.infer<typeof createFormBlock>;