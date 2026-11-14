import z from 'zod';

export const loginFormUser = z.object({
  phonenumber: z
    .string()
    .length(11, 'شماره تلفن باید 11 رقم باشد')
    .regex(/^[0-9]+$/, 'شماره تلفن فقط باید شامل اعداد باشد'),

  password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
});

export type LoginFormValue = z.infer<typeof loginFormUser>;