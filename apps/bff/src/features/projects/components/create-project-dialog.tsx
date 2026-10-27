'use client';

import type { ProjectDto } from '@zaminnegar/api-client';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { fa } from '@/messages/fa';
import { CreateProjectForm } from './create-project-form';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: ProjectDto) => void;
}

/** Modal wrapper around {@link CreateProjectForm}. */
export function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={fa.projects.new}>
      <CreateProjectForm
        onCancel={() => onOpenChange(false)}
        onCreated={(project) => {
          toast.success(fa.projects.created);
          onOpenChange(false);
          onCreated(project);
        }}
      />
    </Dialog>
  );
}
