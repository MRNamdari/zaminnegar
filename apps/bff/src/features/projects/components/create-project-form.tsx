'use client';

import type { ProjectDto } from '@zaminnegar/api-client';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/lib/form/use-app-form';
import { fa } from '@/messages/fa';
import { useCreateProject } from '../hooks/use-create-project';
import { createProjectSchema, type CreateProjectInput } from '../schemas/create-project.schema';

interface CreateProjectFormProps {
  onCreated: (project: ProjectDto) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: CreateProjectInput = { name: '', description: '' };

/** Form that creates a project. Validation runs on every change with the shared zod schema. */
export function CreateProjectForm({ onCreated, onCancel }: CreateProjectFormProps) {
  const createProject = useCreateProject();
  const form = useAppForm({
    defaultValues: DEFAULT_VALUES,
    validators: { onChange: createProjectSchema },
    onSubmit: async ({ value }) => {
      // Failures are reported by the global mutation error toast.
      await createProject.mutateAsync(createProjectSchema.parse(value)).then(onCreated, () => undefined);
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="name">{(field) => <field.TextField label={fa.projects.nameLabel} autoFocus />}</form.AppField>
      <form.AppField name="description">{(field) => <field.TextareaField label={fa.projects.descriptionLabel} rows={3} />}</form.AppField>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {fa.common.cancel}
        </Button>
        <form.AppForm>
          <form.SubmitButton>{fa.common.create}</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  );
}
