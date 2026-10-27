'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils/format';
import { fa } from '@/messages/fa';
import { useProjects } from '../hooks/use-projects';
import { CreateProjectDialog } from './create-project-dialog';

/** Dropdown of projects plus a "new project" action. Changing the selection navigates to that project. */
export function ProjectSelector({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const { data, isPending } = useProjects();
  const [creating, setCreating] = useState(false);
  const goTo = (projectId: string) => router.push(`/projects/${projectId}`);

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={fa.projects.select}
        value={currentProjectId}
        disabled={isPending}
        onChange={(event) => goTo(event.target.value)}
        className="h-9 max-w-64 min-w-44 rounded-md border border-white/20 bg-white/10 px-2 text-white"
      >
        {data?.items.map((project) => (
          <option key={project.id} value={project.id} className="text-ink">
            {project.name} ({formatNumber(project.parcelCount)})
          </option>
        ))}
      </select>
      <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setCreating(true)}>
        <Plus className="size-4" />
        {fa.projects.new}
      </Button>
      <CreateProjectDialog open={creating} onOpenChange={setCreating} onCreated={(project) => goTo(project.id)} />
    </div>
  );
}
