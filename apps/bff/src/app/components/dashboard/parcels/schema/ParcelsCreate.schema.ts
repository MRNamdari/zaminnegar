import { z } from "zod";

export const createFormParcel = z.object({
  nameParcel: z
    .string()
    .min(3, "نام قطعه باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام قطعه باید حداکثر ۵۰ کاراکتر داشته باشد"),
  nameBlock: z.enum(["بلوک 1", "بلوک 2", "بلوک 3", "بلوک 4"] , {
    error: "لطفاً یک بلوک معتبر انتخاب کنید"
  }),
  parcelStatus: z.enum(["فعال" , "غیر فعال"]),
});

export type ParcelFormValue = z.infer<typeof createFormParcel>