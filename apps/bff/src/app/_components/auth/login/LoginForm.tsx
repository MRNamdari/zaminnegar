'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import z from 'zod';
import { fa } from 'zod/locales';

import { Map } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  LoginDto,
  type ProjectResponseDto as Project,
} from '@zaminnegar/api-client';

import { useAppForm } from '../../form/hooks/form';

import {
  useLoginMutation,
  useActiveProjectMutation,
} from '@/app/features/auth/mutation';

import { api } from '@/app/_lib/api.client';

import SelectProject from '../SelectProject';

z.config(fa());

export default function LoginForm() {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loginMutation = useLoginMutation();
  const activeProjectMutation = useActiveProjectMutation();

  // دریافت پروژه‌های کاربر
  const { data, isLoading, isError, error, refetch } = useQuery({
    ...api.get('/projects').queryOptions,
    enabled: false,
  });

  const projects: Project[] = (data?.items ?? []) as Project[];

  // فرم ورود
  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },

    validators: {
      onSubmit: LoginDto,
    },

    onSubmit: async ({ value }) => {
      try {
        const payload = LoginDto.parse(value);

        // ورود کاربر
        const result = await loginMutation.mutateAsync(payload);

        if (!result.success) {
          toast.error(result.message || 'نام کاربری یا رمز عبور اشتباه است');
          return;
        }

        toast.success('با موفقیت وارد شدید');

        // دریافت پروژه‌ها پس از ورود موفق
        const projectsResult = await refetch();

        if (projectsResult.isError) {
          toast.error('خطا در دریافت پروژه‌ها');
          return;
        }

        // نمایش لیست پروژه‌ها
        setIsDialogOpen(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'خطایی هنگام ورود رخ داد';

        toast.error(message);
      }
    },
  });

  // انتخاب و فعال‌سازی پروژه
  const handleSelectProject = async (project: Project) => {
    try {
      await activeProjectMutation.mutateAsync({
        projectId: project.id,
      });

      setIsDialogOpen(false);

      // انتقال به صفحه نقشه
      router.replace('/map');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در انتخاب پروژه',
      );
    }
  };

  // وضعیت انتظار هنگام فعال‌سازی پروژه
  if (activeProjectMutation.isPending || activeProjectMutation.isSuccess) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background">
        <Map className="mb-6 size-16 animate-pulse text-primary" />

        <div className="flex flex-col items-center">
          <div
            role="status"
            className="size-8 animate-spin rounded-full border-4 border-border border-t-primary"
          />

          <p className="mt-5 font-semibold text-foreground">
            در حال ورود به نقشه...
          </p>

          <span className="mt-2 text-sm text-muted-foreground">
            لطفاً منتظر بمانید
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-125 flex-col items-center rounded-4xl bg-background px-8 py-12 shadow-2xl shadow-action-secondary">
      <Map className="flex size-14 items-center justify-center rounded-3xl bg-action-primary p-3 stroke-action-secondary" />

      <h1 className="mb-3 mt-5 text-4xl font-black text-text">زمین نگار</h1>

      <span className="font-medium">مدیریت هوشمند زمین‌های کشاورزی</span>

      <form
        dir="rtl"
        className="mt-10 flex w-full flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppForm>
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                label="نام کاربری"
                placeholder="نام کاربری خود را وارد کنید"
                required
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
                type="password"
                required
              />
            )}
          </form.AppField>

          <form.SubmitButton />
        </form.AppForm>
      </form>

      {/* Project Selection */}
      <SelectProject
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projects={projects}
        isLoading={isLoading}
        isError={isError}
        error={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        onSelect={handleSelectProject}
      />
    </div>
  );
}
