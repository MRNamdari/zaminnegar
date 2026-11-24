'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

import { fa } from 'zod/locales';
import z from 'zod';

import {
  LoginDto,
  type ProjectResponseDto as Project,
} from '@zaminnegar/api-client';

import { useAppForm } from '@/app/_components/form/hooks/form';
import {
  useActiveProjectMutation,
  useLoginMutation,
} from '@/app/features/auth/mutation';
import { api } from '@/app/_lib/api.client';

import { Dialog } from '../../Dialog';

import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/app/features/projects/mutation';


z.config(fa());

const initialValues: LoginDto = {
  username: '',
  password: '',
};

export default function LoginForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const loginMutation = useLoginMutation();
  const activeProjectMutation = useActiveProjectMutation();

  // Reset active project mutation state when redirected to login page after successful login
  useEffect(()=>{
    activeProjectMutation.reset()
  }, []);

  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useQuery({
    ...api.get('/projects').queryOptions,
    enabled: false,
  });

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

        toast.success('با موفقیت وارد شدید');

        // دریافت پروژه‌ها بعد از ورود موفق
        const projectsResult = await refetch();

        if (projectsResult.isError) {
          toast.error('خطا در دریافت پروژه‌ها');
          return;
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

  const handleSelectProject = async (project: Project) => {
    try {
      const { projectId } = await activeProjectMutation.mutateAsync({
        projectId: project.id,
      });

      console.log('Selected project:', projectId);

      setIsOpen(false);

      router.replace('/map');
      router.refresh();
    } catch (error) {

      toast.error(
        error instanceof Error ? error.message : 'خطا در انتخاب پروژه',
      );
    }
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createProject = useCreateProjectMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const updateProject = useUpdateProjectMutation();

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditOpen(true);
  };

  const deleteProject = useDeleteProjectMutation();
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
    useState(false);

  const handleDeleteProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteProjectModalOpen(true);
  };
  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const result = await deleteProject.mutateAsync(selectedProject.id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('پروژه با موفقیت حذف شد');

      setIsDeleteProjectModalOpen(false);
      setSelectedProject(null);

      void refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در حذف پروژه');
    }
  };

  console.log(activeProjectMutation)
  if (activeProjectMutation.isPending || activeProjectMutation.isSuccess) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background">
        <Image
          src="/zaminnegar-logo-2.png"
          alt="Zaminnegar"
          width={100}
          height={100}
          className="mb-6 animate-pulse"
        />

        <div role="status" className='justify-center flex flex-col'>
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand mx-auto"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              className="fill-action-primary"
            />
          </svg>
          <p className="mt-5 text-foreground font-semibold w-fit mx-auto">
            در حال ورود به نقشه...
          </p>
          <span className="mt-2 text-sm text-muted-foreground w-fit mx-auto">
            لطفاً منتظر بمانید
          </span>
        </div>
      </div>
    );
  }

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
        open={isDeleteProjectModalOpen}
        onOpenChange={setIsDeleteProjectModalOpen}
        title="حذف پروژه"
        description={`آیا از حذف پروژه «${selectedProject?.name ?? ''}» اطمینان دارید؟`}
        className="text-white"
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIsDeleteProjectModalOpen(false);
              setSelectedProject(null);
            }}
            disabled={deleteProject.isPending}
            className="w-1/2 p-3 rounded-md bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleDeleteProject}
            disabled={deleteProject.isPending}
            className="w-1/2 p-3 rounded-md bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer disabled:opacity-50"
          >
            {deleteProject.isPending ? 'در حال حذف...' : 'حذف پروژه'}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
