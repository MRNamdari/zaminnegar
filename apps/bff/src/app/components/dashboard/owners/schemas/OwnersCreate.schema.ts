
import { z } from "zod";

export const createFormOwner = z.object({
  name: z
    .string()
    .min(3, "نام باید حداقل ۳ کاراکتر داشته باشد")
    .max(50, "نام باید حداکثر ۵۰ کاراکتر داشته باشد"),

  nationalCode: z
    .string()
    .length(10, "کد ملی باید ۱۰ رقم باشد")
    .regex(/^[0-9]{10}$/, "کد ملی باید عددی باشد"),

  phoneNumber: z
    .string()
    .length(11, "شماره تماس باید ۱۱ رقم باشد")
    .regex(/^[0-9]{11}$/, "شماره تماس باید عددی باشد"),

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
    .max(255, "آدرس باید حداکثر ۲۵۵ کاراکتر داشته باشد"),

  parcelShares: z.array(
    z.object({
      parcelId: z.string().min(1, "انتخاب قطعه الزامی است"),
      share: z
        .number()
        .min(0.01, "درصد سهم باید بیشتر از صفر باشد")
        .max(100, "درصد سهم نمی‌تواند بیشتر از ۱۰۰ باشد"),
    })
  ),
}).superRefine((data, ctx) => {
  const parcelIds = data.parcelShares.map(
    (item) => item.parcelId
  );

  if (new Set(parcelIds).size !== parcelIds.length) {
    ctx.addIssue({
      code: "custom",
      path: ["parcelShares"],
      message: "یک قطعه را نمی‌توان چند بار انتخاب کرد",
    });
  }
});

export type OwnerFormValues = z.infer<typeof createFormOwner>;
