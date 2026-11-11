import { z } from 'zod';

const ownerShareSchema = z.object({
  ownerId: z.string().min(1, 'لطفاً مالک را انتخاب کنید'),

  share: z
    .union([z.number(), z.literal('')])
    .refine(
      (value) => typeof value === 'number' && value > 0 && value <= 100,
      'درصد سهم باید بیشتر از صفر و حداکثر ۱۰۰ باشد',
    ),
});

export const createFormParcel = z.object({
  nameParcel: z
    .string()
    .min(3, 'نام قطعه باید حداقل ۳ کاراکتر داشته باشد')
    .max(50, 'نام قطعه باید حداکثر ۵۰ کاراکتر داشته باشد'),

  parcelStatus: z.enum(['فعال', 'غیر فعال']),

  owners: z
    .array(ownerShareSchema)
    .min(1, 'حداقل یک مالک برای قطعه انتخاب کنید'),
});

export type ParcelFormValue = z.infer<typeof createFormParcel>;
