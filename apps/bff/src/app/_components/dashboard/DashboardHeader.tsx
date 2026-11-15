'use client';

import { type ProjectResponseDto as Project } from '@zaminnegar/api-client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import {
  BsArrowLeftRight,
  BsBoxArrowRight,
  BsChevronDown,
  BsFolder2Open,
} from 'react-icons/bs';

import { CgSearch } from 'react-icons/cg';

import { api } from '@/app/_lib/api.client';
import { useQuery } from '@tanstack/react-query';
import {
  useLogoutMutation,
  useActiveProjectMutation,
} from '@/app/features/auth/mutation';
import { useRouter } from 'next/navigation';
import SelectProject from '../auth/SelectProject';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog } from '../Dialog';
import ProjectsFormUpdate from './projects/ProjectsFormUpdate';
import { toast } from 'react-toastify';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/app/features/projects/mutation';
import { UpdateFormProjectValues } from './projects/schema/ProjectsUpdate.schema';
import ProjectsFormCreate from './projects/ProjectsFormCreate';
import { ProjectFormValue } from './projects/schema/ProjectsCreate.schema';

export default function DashboardHeader() {
  const { data: userData } = useQuery(api.get('/auth/me').queryOptions);
  const userName = userData?.username ?? '';

  const { data: me } = useQuery(api.get('/auth/me').queryOptions);

  const activeProjectId = me?.activeProjectId;

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery(
    api.get('/projects').queryOptions,
  );

  const logoutMutation = useLogoutMutation();
  const activeProjectMutation = useActiveProjectMutation();
  const router = useRouter();
  const projects: Project[] = (data?.items ?? []) as Project[];

  const [isOpen, setIsOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // باز کردن دیالوگ انتخاب پروژه
  const handleSwitchProject = () => {
    setIsOpen(false);
    setIsProjectDialogOpen(true);
  };

  // خروج از حساب (فعلاً نمایشی)
  const handleLogout = async () => {
    setIsOpen(false);
    console.log('Logout clicked');
    const result = await logoutMutation.mutateAsync();
    console.log(result);

    router.replace('/login');
    router.refresh();
  };

  const handleSelectProject = async (project: Project) => {
    try {
      console.log(project);
      const result = await activeProjectMutation.mutateAsync({
        projectId: project.id,
      });

      console.log('Project changed:', result);

      // پاک کردن اطلاعات Cache پروژه قبلی
      queryClient.clear();

      setIsProjectDialogOpen(false);

      router.replace('/map');
      router.refresh();
    } catch (error) {
      console.error('Error selecting project:', error);
    }
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
    <>
      <header className="grid grid-cols-3 items-center border-b border-border p-4">
        {/* Right Navigation */}
        <nav className="right_nav flex items-start">
          <div ref={menuRef} className="relative">
            {/* Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 transition-all duration-200 cursor-pointer ${
                isOpen ? 'bg-surface-muted' : 'hover:bg-surface-muted'
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-tl from-blue-300 to-blue-100">
                <span className="font-black text-blue-950 -mt-1">
                  {userName.trim().charAt(0) || '؟'}
                </span>
              </div>

              <span className="font-medium text-sm text-foreground">
                {userName}
              </span>

              <BsChevronDown
                size={12}
                className={`text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Information */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-muted/70 p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tl from-blue-300 to-blue-100">
                    <span className="font-black text-blue-950">
                      {userName.trim().charAt(0) || '؟'}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-bold text-foreground">
                      {userName}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      حساب کاربری شما
                    </span>
                  </div>
                </div>

                <div className="my-2 h-px bg-border" />

                {/* Switch Project */}
                <button
                  type="button"
                  onClick={handleSwitchProject}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors hover:bg-primary/10 cursor-pointer"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <BsArrowLeftRight size={17} />
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      تعویض پروژه
                    </span>

                    <span className="text-xs text-muted-foreground">
                      انتخاب یک پروژه دیگر
                    </span>
                  </div>

                  <BsFolder2Open size={16} className="text-muted-foreground" />
                </button>

                <div className="my-2 h-px bg-border" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-colors duration-300 hover:bg-red-500/10 cursor-pointer"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition duration-300 group-hover:bg-red-500 group-hover:text-white">
                    <BsBoxArrowRight size={17} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-red-500">
                      خروج از حساب
                    </span>

                    <span className="text-xs text-muted-foreground">
                      خارج شدن از حساب کاربری
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Middle Navigation - Search */}
        <nav className="middle_nav flex items-center justify-center">
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2"
          >
            <label htmlFor="simple-search" className="sr-only">
              جستجو
            </label>

            <div className="min-w-0 flex-1">
              <input
                type="search"
                id="simple-search"
                placeholder="جستجوی منطقه یا بلوک..."
                className="block w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:ring-2 focus:ring-action-primary-hover/20"
              />
            </div>

            <button
              type="submit"
              aria-label="جستجو"
              className="flex shrink-0 items-center justify-center rounded-lg bg-action-primary p-2 text-white transition duration-300 hover:bg-action-primary-hover focus:outline-none focus:ring-2 focus:ring-action-primary-hover/20"
            >
              <CgSearch fontSize={24} />
            </button>
          </form>
        </nav>

        {/* Left Navigation - Logo */}
        <nav className="left_nav flex items-center justify-end gap-3">
          <strong className="text-foreground">سامانه زمین نگار</strong>

          <Image
            src="/zaminnegar-logo-2.png"
            alt="Zaminnegar"
            width={40}
            height={40}
          />
        </nav>
      </header>

      {/* Project Selection Dialog */}
      <SelectProject
        addProject={true}
        onAddProject={() => setIsCreateOpen(true)}
        onDelete={handleDeleteProjectClick}
        onEdit={handleEditProject}
        activeProjectId={activeProjectId}
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
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
    </>
  );
}
