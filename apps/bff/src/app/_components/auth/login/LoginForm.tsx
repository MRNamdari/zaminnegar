'use client';

import { useState } from 'react';
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
import SelectProject from '../SelectProject';
import ProjectsFormCreate from '../../dashboard/projects/ProjectsFormCreate';
import ProjectsFormUpdate from '../../dashboard/projects/ProjectsFormUpdate';
import { Dialog } from '../../Dialog';
import { ProjectFormValue } from '../../dashboard/projects/schema/ProjectsCreate.schema';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/app/features/projects/mutation';
import { UpdateFormProjectValues } from '../../dashboard/projects/schema/ProjectsUpdate.schema';

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
    const { projectId } = await activeProjectMutation.mutateAsync({
      projectId: project.id,
    });

    console.log('Selected project:', projectId);

    setIsOpen(false);

    // در مرحله بعد باید project.id در state مدیریت پروژه ذخیره شود.
    router.replace('/map');
    router.refresh();
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createProject = useCreateProjectMutation();
  const handleCreateProject = async (values: ProjectFormValue) => {
    try {
      const result = await createProject.mutateAsync({
        name: values.name,
        description: values.description,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('پروژه با موفقیت ایجاد شد');

      setIsCreateOpen(false);

      void refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در ایجاد پروژه',
      );
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const updateProject = useUpdateProjectMutation();

  const handleUpdateProject = async (value: UpdateFormProjectValues) => {
    if (!selectedProject) return;

    try {
      const result = await updateProject.mutateAsync({
        id: selectedProject.id,
        value: {
          name: value.name,
          description: value.description,
        },
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('پروژه با موفقیت ویرایش شد');

      setIsEditOpen(false);
      setSelectedProject(null);

      void refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در ویرایش پروژه',
      );
    }
  };
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
      <SelectProject
        onDelete={handleDeleteProjectClick}
        onEdit={handleEditProject}
        addProject={true}
        onAddProject={() => setIsCreateOpen(true)}
        open={isOpen}
        onOpenChange={setIsOpen}
        projects={projects}
        isLoading={isLoading}
        isError={isError}
        error={error instanceof Error ? error.message : undefined}
        isSelecting={activeProjectMutation.isPending}
        onRetry={() => void refetch()}
        onSelect={handleSelectProject}
      />
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="افزودن پروژه جدید"
        description="اطلاعات پروژه جدید را وارد کنید."
      >
        <ProjectsFormCreate
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Dialog>
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);

          if (!open) {
            setSelectedProject(null);
          }
        }}
        title="ویرایش پروژه"
        description="اطلاعات پروژه را ویرایش کنید."
      >
        {selectedProject && (
          <ProjectsFormUpdate
            project={selectedProject}
            onSubmit={handleUpdateProject}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedProject(null);
            }}
          />
        )}
      </Dialog>
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
