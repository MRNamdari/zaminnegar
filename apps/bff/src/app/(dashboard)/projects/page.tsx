'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import ProjectsTable from '@/app/_components/dashboard/projects/ProjectsTable';
import ProjectsCreateForm from '@/app/_components/dashboard/projects/projects-forms/ProjectsCreateForm';

import { Dialog } from '@/app/_components/Dialog';

import { useCreateProjectMutation } from '@/app/features/projects/mutation';
import { api } from '@/app/_lib/api.client';

export default function Page() {
  // Form State
  // Controls the form version to reset all fields after successful project creation.
  const [formKey, setFormKey] = useState(0);

  // Dialog State
  // Controls the visibility of the create project dialog.
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query & Mutation
  // Provides access to the query cache and the project creation mutation.
  const queryClient = useQueryClient();
  const createProjectMutation = useCreateProjectMutation();
  const projectsQuery = api.get('/projects').queryOptions;

  // Handle Create Project
  // Creates a new project, refreshes the projects list, resets the form,
  // and closes the dialog after a successful operation.
  const handleCreateProject = async (value: {
    name: string;
    description?: string;
  }) => {
    try {
      await createProjectMutation.mutateAsync(value);

      await queryClient.invalidateQueries({
        queryKey: projectsQuery.queryKey,
      });

      setFormKey((prev) => prev + 1);
      setIsCreateDialogOpen(false);

      toast.success('پروژه با موفقیت ایجاد شد');
    } catch (error) {
      console.error('خطا در ایجاد پروژه:', error);

      toast.error('ایجاد پروژه با خطا مواجه شد');

      throw error;
    }
  };

  // Handle Open Create Dialog
  // Opens the dialog when the user clicks the add project button.
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  // Handle Close Create Dialog
  // Closes the dialog when the user dismisses it.
  const handleCloseCreateDialog = (open: boolean) => {
    setIsCreateDialogOpen(open);
  };

  // Render Page
  // Displays the projects table, floating action button, and create project dialog.
  return (
    <div className="p-4 space-y-4 pb-20">
      <ProjectsTable />

      {/* Create Project Button */}
      <button
        type="button"
        title="افزودن پروژه"
        onClick={handleOpenCreateDialog}
        className="cursor-pointer p-4 rounded-full bg-action-primary fixed left-4 bottom-15 shadow-lg shadow-action-primary-hover/20"
      >
        <Plus className="text-black-fixed" />
      </button>

      {/* Create Project Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseCreateDialog}
        title="افزودن پروژه جدید"
        description="اطلاعات پروژه جدید را وارد کنید"
      >
        <ProjectsCreateForm key={formKey} onCreate={handleCreateProject} />
      </Dialog>
    </div>
  );
}
