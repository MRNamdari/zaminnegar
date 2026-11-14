'use client';

import { useAppForm } from '@/app/components/form/hooks/form';
import { loginFormUser, LoginFormValue } from './schema/AddUser.schema';
import Image from 'next/image';

interface Props {
  onSubmit: (values: LoginFormValue) => void;
}

const initialValues: LoginFormValue = {
  phonenumber: '',
  password: '',
};

export default function LoginForm({ onSubmit }: Props) {
  const form = useAppForm({
    defaultValues: initialValues,

    validators: {
      onSubmit: loginFormUser,
    },

    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    void form.handleSubmit();
  };

  return (
    <div className="max-w-360 mx-auto w-full">
      <div className="w-full max-w-125 p-7 rounded-3xl border-border border bg-surface flex flex-col items-center relative overflow-hidden">
        <div className="flex flex-col items-center z-5">
          <Image
            src="/zaminnegar-logo-2.png"
            alt="Zaminnegar"
            width={100}
            height={100}
          />
          <h1 className="text-5xl text-foreground font-black mt-3">
            زمین نگار
          </h1>
          <h4 className="text-lg text-foreground font-semibold mt-7">
            به زمین نگار خوش آمدید
          </h4>
          <span className="text-foreground text-sm mt-2 mb-5">
            برای ادامه وارد حساب کاربری خود شوید
          </span>
        </div>
        <div className="w-full z-5">
          <form.AppForm>
            <form
              noValidate
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-4"
            >
              <form.AppField
                name="phonenumber"
                validators={{
                  onSubmit: loginFormUser.shape.phonenumber,
                }}
              >
                {(field) => (
                  <field.TextField placeholder="شماره تلفن خود را وارد کنید" />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onSubmit: loginFormUser.shape.password,
                }}
              >
                {(field) => (
                  <field.TextField placeholder="رمز عبور خود را وارد کنید" />
                )}
              </form.AppField>

              <form.SubmitButton label="ورود" />
            </form>
          </form.AppForm>
        </div>
        <div className="absolute -top-15 -left-62.5 rotate-125">
          <Image
            width={500}
            height={500}
            src="/patternform.png"
            alt="pattern"
            className="min-w-170 opacity-30"
          />

          <div className="absolute inset-0 bg-linear-to-b from-surface to-transparent" />
        </div>
        <div className="absolute -top-15 -right-170 rotate-90">
          <Image
            width={500}
            height={500}
            src="/patternform.png"
            alt="pattern"
            className="min-w-300 opacity-30"
          />

          <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent" />
        </div>
      </div>
    </div>
  );
}
