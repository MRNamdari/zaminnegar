'use client';

import { useState } from 'react';

import { useActiveProjectMutation } from '@/app/features/auth/mutation';
import { useUpdateProjectMutation } from '@/app/features/projects/mutation';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';
import { useTable, type ColumnDef } from '@tanstack/react-table';

import { Pencil, Trash2 } from 'lucide-react';

import type { ProjectResponseDto as Project } from '@zaminnegar/api-client';

import { api } from '@/app/_lib/api.client';

import { useDeleteProjectMutation } from '@/app/features/projects/mutation';

import {
  Table,
  BASIC_TABLE_FEATURES,
  type BasicTableFeatures,
} from '../table/Table';

import Search from '@/app/_components/dashboard/Search';
import { Dialog } from '../../Dialog';
import DialogPopup from '../../DeletePopup';
import { toast } from 'react-toastify';
import ProjectsUpdateForm from './projects-forms/ProjectsUpdateForm';

// ========================================
// Component
// ========================================

export default function ProjectsTable() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ========================================
  // States
  // ========================================

  const [search, setSearch] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project>();

  // ========================================
  // Query
  // ========================================

  const projectsQuery = api.get('/projects').queryOptions;

  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({
    ...projectsQuery,
  });

  // ========================================
  // Mutations
  // ========================================

  const activeProjectMutation = useActiveProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();

  // ========================================
  // Dialog Handlers
  // ========================================

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    setIsDeleteDialogOpen(open);

    if (!open) {
      setSelectedProject(undefined);
    }
  };

  // ========================================
  // Project Handlers
  // ========================================

  const handleSelectProject = async (project: Project) => {
    try {
      await activeProjectMutation.mutateAsync({
        projectId: project.id,
      });

      await queryClient.invalidateQueries();

      router.push('/map');
      router.refresh();
    } catch (error) {
      console.error('خطا در انتخاب پروژه:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    try {
      await deleteProjectMutation.mutateAsync(selectedProject.id);

      await queryClient.invalidateQueries({
        queryKey: projectsQuery.queryKey,
      });

      toast.success('پروژه با موفقیت حذف شد');
    } catch (error) {
      toast.error('حذف پروژه با خطا مواجه شد');
      throw error;
    }
  };

  const handleUpdateProject = async (value: {
    name: string;
    description: string;
  }) => {
    if (!selectedProject) return;

    try {
      await updateProjectMutation.mutateAsync({
        id: selectedProject.id,
        value,
      });

      await queryClient.invalidateQueries({
        queryKey: projectsQuery.queryKey,
      });

      setIsEditDialogOpen(false);
      setSelectedProject(undefined);

      toast.success('پروژه با موفقیت ویرایش شد');
    } catch (error) {
      console.error('خطا در ویرایش پروژه:', error);
      toast.error('ویرایش پروژه با خطا مواجه شد');
    }
  };

  // ========================================
  // Data Filtering
  // ========================================

  const filteredProjects = (projects?.items ?? []).filter((project) => {
    const query = search.trim().toLocaleLowerCase();

    return (
      project.name.toLocaleLowerCase().includes(query) ||
      project.description?.toLocaleLowerCase().includes(query)
    );
  });

  // ========================================
  // Columns
  // ========================================

  const columns: ColumnDef<BasicTableFeatures, Project>[] = [
    {
      accessorKey: 'name',
      header: 'نام پروژه',
      cell: ({ row, getValue }) => (
        <button
          type="button"
          onClick={() => void handleSelectProject(row.original)}
          disabled={activeProjectMutation.isPending}
          className="font-normal cursor-pointer text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {getValue<string>()}
        </button>
      ),
    },
    {
      accessorKey: 'description',
      header: 'توضیحات',
    },
    {
      accessorKey: 'ownersCount',
      header: 'تعداد مالکین',
    },
    {
      accessorKey: 'regionsCount',
      header: 'تعداد مناطق',
    },
    {
      accessorKey: 'blocksCount',
      header: 'تعداد بلوک‌ها',
    },
    {
      accessorKey: 'parcelsCount',
      header: 'تعداد قطعات',
    },
    {
      id: 'actions',
      header: 'عملیات',
      enableSorting: false,
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="flex items-center justify-start gap-2.5">
            <button
              type="button"
              title="ویرایش پروژه"
              onClick={() => handleEditProject(project)}
              className="rounded-xl p-3 transition duration-300 flex items-center gap-3 font-normal text-sm cursor-pointer bg-surface-muted/60 hover:bg-surface-muted-hover/70"
            >
              <Pencil size={17} />
              <span>ویرایش</span>
            </button>

            <button
              type="button"
              title="حذف پروژه"
              onClick={() => handleDeleteProject(project)}
              className="rounded-xl p-3 text-action-error bg-action-error/10 dark:bg-action-error/70 dark:text-current dark:hover:bg-action-error-hover hover:bg-action-error/20 transition duration-300 flex items-center gap-3 font-normal text-sm cursor-pointer"
            >
              <Trash2 size={17} />
              <span>حذف</span>
            </button>
          </div>
        );
      },
    },
  ];

  // ========================================
  // Table
  // ========================================

  const table = useTable({
    features: BASIC_TABLE_FEATURES,
    columns,
    data: filteredProjects,
  });

  // ========================================
  // Render
  // ========================================

  return (
    <div className="space-y-4">
      <Search onSearch={setSearch} />

      {isError ? (
        <div className="py-10 text-center text-red-400">
          خطا در دریافت اطلاعات پروژه‌ها
        </div>
      ) : (
        <Table table={table} isLoading={isPending} />
      )}

      {/* Edit Project Dialog */}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedProject(undefined);
          }
        }}
        title="ویرایش پروژه"
        description={`ویرایش اطلاعات پروژه ${selectedProject?.name ?? ''}`}
      >
        <ProjectsUpdateForm
          project={selectedProject}
          onUpdate={handleUpdateProject}
        />
      </Dialog>

      {/* Delete Project Dialog */}

      <DialogPopup
        open={isDeleteDialogOpen}
        onOpenChange={handleCloseDeleteDialog}
        title="حذف پروژه"
        description={`آیا از حذف پروژه «${selectedProject?.name ?? ''}» اطمینان دارید؟`}
        confirmText="حذف پروژه"
        isLoading={deleteProjectMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
