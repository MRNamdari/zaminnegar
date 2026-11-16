'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import ProjectTable, {
  type Project,
} from '@/app/_components/dashboard/projects/ProjectTable';

import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';

import { Dialog } from '@/app/_components/Dialog';

import ProjectFormCreate from '@/app/_components/dashboard/projects/ProjectsFormCreate';
import ProjectsFormUpdate from '@/app/_components/dashboard/projects/ProjectsFormUpdate';

import { ProjectFormValue } from '@/app/_components/dashboard/projects/schema/ProjectsCreate.schema';
import { UpdateFormProjectValues } from '@/app/_components/dashboard/projects/schema/ProjectsUpdate.schema';

import { api } from '@/app/_lib/api.client';

import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/app/features/projects/mutation';

import { useActiveProjectMutation } from '@/app/features/auth/mutation';

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // دریافت پروژه‌ها
  const { data, isLoading, isError, error, refetch } = useQuery({
    ...api.get('/projects').queryOptions,
  });

  const projects: Project[] = data?.items ?? [];

  // States
  const [searchValue, setSearchValue] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Mutations
  const createProject = useCreateProjectMutation();
  const updateProject = useUpdateProjectMutation();
  const deleteProject = useDeleteProjectMutation();
  const activeProjectMutation = useActiveProjectMutation();

  // جستجوی پروژه‌ها
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );

  // انتخاب و فعال‌سازی پروژه
  const handleSelectProject = async (project: Project) => {
    try {
      await activeProjectMutation.mutateAsync({
        projectId: project.id,
      });
      // clear catch for update project map
      queryClient.invalidateQueries()
      router.push('/map');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در انتخاب پروژه',
      );
    }
  };

  // ایجاد پروژه
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

      setIsAddModalOpen(false);

      void refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در ایجاد پروژه',
      );
    }
  };

  // باز کردن فرم ویرایش
  const handleOpenUpdateModal = (project: Project) => {
    setSelectedProject(project);
    setIsUpdateModalOpen(true);
  };

  // ویرایش پروژه
  const handleUpdateProject = async (values: UpdateFormProjectValues) => {
    if (!selectedProject) return;

    try {
      const result = await updateProject.mutateAsync({
        id: selectedProject.id,
        value: {
          name: values.name,
          description: values.description,
        },
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('پروژه با موفقیت ویرایش شد');

      setIsUpdateModalOpen(false);
      setSelectedProject(null);

      void refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'خطا در ویرایش پروژه',
      );
    }
  };

  // باز کردن دیالوگ حذف
  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  // حذف پروژه
  const confirmDelete = async () => {
    if (!selectedProject) return;

    try {
      const result = await deleteProject.mutateAsync(selectedProject.id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('پروژه با موفقیت حذف شد');

      setIsDeleteModalOpen(false);
      setSelectedProject(null);

      void refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در حذف پروژه');
    }
  };

  return (
    <div className="w-full px-4 h-full overflow-y-auto">
      <div className="w-full mx-auto flex flex-col gap-4 items-center pb-4 pt-6">
        {/* عنوان صفحه */}
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          پروژه ها
        </h2>

        {/* Header */}
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جوی پروژه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی پروژه..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full py-2.5 px-3 text-sm text-foreground border-0 outline-none transition placeholder:text-foreground-muted"
              />

              <button
                type="submit"
                aria-label="جستجو"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition duration-300 focus:outline-none cursor-pointer"
              >
                <CgSearch className="text-action-primary text-lg" />
              </button>
            </search>
          </form>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن پروژه</span>
          </button>
        </div>

        {/* Loading / Error / Empty / Table */}
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <p className="text-sm text-foreground-muted">
              در حال دریافت اطلاعات پروژه‌ها...
            </p>
          </div>
        ) : isError ? (
          <div className="w-full flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-sm text-red-500">
              {error instanceof Error
                ? error.message
                : 'خطا در دریافت اطلاعات پروژه‌ها'}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="px-5 py-2 rounded-lg bg-action-primary text-white text-sm cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="w-full flex justify-center py-12">
            <p className="text-sm text-foreground-muted">
              {searchValue
                ? 'پروژه‌ای با این مشخصات پیدا نشد.'
                : 'هنوز پروژه‌ای ثبت نشده است.'}
            </p>
          </div>
        ) : (
          <ProjectTable
            data={filteredProjects}
            onDelete={handleDelete}
            onEdit={handleOpenUpdateModal}
            onRowClick={handleSelectProject}
            searchValue={searchValue}
          />
        )}

        {/* Create Project Dialog */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          title="افزودن پروژه"
          description="اطلاعات پروژه جدید را وارد کنید"
          className="text-white"
        >
          <ProjectFormCreate
            onSubmit={handleCreateProject}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Dialog>

        {/* Update Project Dialog */}
        <Dialog
          open={isUpdateModalOpen}
          onOpenChange={(open) => {
            setIsUpdateModalOpen(open);

            if (!open) {
              setSelectedProject(null);
            }
          }}
          title="ویرایش پروژه"
          description="اطلاعات پروژه را ویرایش کنید"
          className="text-white"
        >
          {selectedProject && (
            <ProjectsFormUpdate
              project={selectedProject}
              onSubmit={handleUpdateProject}
              onCancel={() => {
                setIsUpdateModalOpen(false);
                setSelectedProject(null);
              }}
            />
          )}
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={(open) => {
            setIsDeleteModalOpen(open);

            if (!open) {
              setSelectedProject(null);
            }
          }}
          title="حذف پروژه"
          description={`آیا از حذف پروژه «${selectedProject?.name ?? ''}» اطمینان دارید؟`}
          className="text-white"
        >
          {selectedProject && (
            <div className="flex flex-col gap-5 mt-4">
              <p className="text-sm text-slate-300">
                آیا مطمئن هستید که می‌خواهید
                <span className="text-white font-semibold mx-1">
                  {selectedProject.name}
                </span>
                را حذف کنید؟
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProject(null);
                  }}
                  disabled={deleteProject.isPending}
                  className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer disabled:opacity-50"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteProject.isPending}
                  className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer disabled:opacity-50"
                >
                  {deleteProject.isPending ? 'در حال حذف...' : 'حذف پروژه'}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}
