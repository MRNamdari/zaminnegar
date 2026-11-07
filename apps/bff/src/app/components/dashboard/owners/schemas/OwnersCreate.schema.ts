import { z } from "zod";

export const createFormOwner = z.object({
  name: z
    .string()
    .min(3, "نام باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام باید حداکثر ۵۰ کاراکتر داشته باشد"),
  nationalCode: z
    .string()
    .length(11, "کد ملی باید ۱۱ رقم باشد")
    .regex(/^[0-9]{11}$/, "نوع ورودی باید عدد باشد"),
  phoneNumber: z
    .string()
    .length(11, "شماره تماس باید ۱۱ رقم باشد")
    .regex(/^[0-9]{11}$/, "نوع ورودی باید عدد باشد"),
  fatherName: z
    .string()
    .min(3, "نام پدر باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام پدر باید حداکثر ۵۰ کاراکتر داشته باشد"),
  parcelCount: z.number().nonnegative(),
  totalArea: z.number().nonnegative(),
  status: z.enum(["فعال", "غیر فعال"]),
  address: z
    .string()
    .min(3, "آدرس باید حداقل ۳ کاراکتر داشته باشد")
    .max(255, "آدرس باید حداکثر ۵۰ کاراکتر داشته باشد"),
});

export type OwnerFormValues = z.infer<typeof createFormOwner>;