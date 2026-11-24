import z from 'zod';

export const createFormRole = z.object({
  name: z
    .string()
    .min(3, 'نام نقش باید حداقل 3 کاراکتر باشد')
    .max(50, 'نام نقش نباید بیشتر از 50 کاراکتر باشد'),

  description: z.string().max(500, 'توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد'),
});

export type RoleFormValue = z.infer<typeof createFormRole>;
