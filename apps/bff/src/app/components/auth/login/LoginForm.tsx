'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

import { fa } from 'zod/locales';
import z from 'zod';

import { LoginDto } from '@zaminnegar/api-client';

import { useAppForm } from '@/app/_components/form/hooks/form';
import { Dialog } from '@/app/_components/Dialog';
import { useLoginMutation } from '@/app/features/auth/mutation';
import { api } from '@/app/_lib/api.client';
import { BsFolder2Open, BsArrowLeft, BsCalendar3 } from 'react-icons/bs';

z.config(fa());

const initialValues: LoginDto = {
  username: '',
  password: '',
};

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loginMutation = useLoginMutation();
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery(
    api.get('/projects').queryOptions,
  );

  // تبدیل خروجی API به آرایه‌ای با تایپ مشخص
  const projects: Project[] = (data?.items ?? []) as Project[];

  const form = useAppForm({
    defaultValues: initialValues,

    validators: {
      onSubmit: LoginDto,
    },

    onSubmit: async ({ value }) => {
      try {
        const result = await loginMutation.mutateAsync(value);

        if (!result.success) {
          toast.error(result.message || 'نام کاربری یا رمز عبور اشتباه است');
          return;
        }

        // دریافت پروژه‌ها بعد از ورود موفق
        const projectsResult = await refetch();

        if (projectsResult.isError) {
          toast.error('خطا در دریافت پروژه‌ها');
        }

        setIsOpen(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'خطایی هنگام ورود رخ داد';

        toast.error(message);
      }
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    void form.handleSubmit();
  };

  const handleSelectProject = (project: Project) => {
    console.log('Selected project:', project.id);

    setIsOpen(false);

    // در مرحله بعد باید project.id در state مدیریت پروژه ذخیره شود.
    router.replace('/map');
    router.refresh();
  };

  return (
    <div>
      <div className="w-full mx-auto">
        <div className="mr-40 w-120 p-7 rounded-3xl border-border border bg-surface flex flex-col items-center relative overflow-hidden">
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
                  name="username"
                  validators={{
                    onSubmit: LoginDto.shape.username,
                  }}
                >
                  {(field) => (
                    <field.TextField placeholder="نام کاربری خود را وارد کنید" />
                  )}
                </form.AppField>

                <form.AppField
                  name="password"
                  validators={{
                    onSubmit: LoginDto.shape.password,
                  }}
                >
                  {(field) => (
                    <div className="relative">
                      <field.TextField
                        placeholder="رمز عبور خود را وارد کنید"
                        type={showPassword ? 'text' : 'password'}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'
                        }
                      >
                        {showPassword ? (
                          <BsEyeSlash fill="#d1d1d1" size={18} />
                        ) : (
                          <BsEye fill="#d1d1d1" size={18} />
                        )}
                      </button>
                    </div>
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

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="پروژه‌های شما"
        description="برای ادامه، پروژه موردنظر خود را انتخاب کنید."
      >
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <p className="text-center text-sm text-foreground-secondary py-8">
              در حال دریافت پروژه‌ها...
            </p>
          ) : isError ? (
            <div className="text-center py-8 flex flex-col gap-3">
              <p className="text-sm text-red-500">
                {error instanceof Error
                  ? error.message
                  : 'خطا در دریافت پروژه‌ها'}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="text-sm text-primary hover:underline"
              >
                تلاش مجدد
              </button>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-sm text-foreground-secondary py-8">
              هیچ پروژه‌ای برای شما ثبت نشده است.
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSelectProject(project)}
                className="group relative w-full overflow-hidden rounded-2xl border border-border bg-surface p-5 text-right transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              >
                {/* افکت پس‌زمینه */}
                <div className="absolute -left-10 -top-10 size-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />

                <div className="relative flex items-start justify-between gap-4">
                  {/* آیکون پروژه */}
                  <div className="flex bg-surface-muted hover:bg-surface-muted-hover size-12 shrink-0 items-center justify-center rounded-2xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <BsFolder2Open size={23} />
                  </div>

                  {/* اطلاعات پروژه */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </h3>

                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {project.description ||
                        'توضیحاتی برای این پروژه ثبت نشده است.'}
                    </p>
                  </div>

                  {/* فلش انتخاب */}
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                    <BsArrowLeft size={18} />
                  </div>
                </div>

                {/* جداکننده */}
                <div className="my-4 h-px w-full bg-border/70" />

                {/* تاریخ ایجاد */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BsCalendar3 size={14} />
                    <span>تاریخ ایجاد</span>
                  </div>

                  <span className="text-xs font-medium text-foreground">
                    {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </Dialog>
    </div>
  );
}
