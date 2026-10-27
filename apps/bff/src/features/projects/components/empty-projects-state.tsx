'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StateMessage } from '@/components/ui/state-message';
import { fa } from '@/messages/fa';
import { CreateProjectDialog } from './create-project-dialog';

/** Landing state when no project exists yet (or the list could not be loaded). */
export function EmptyProjectsState({ loadFailed = false }: { loadFailed?: boolean }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-content-center gap-4 p-6">
      <h1 className="text-xl font-bold">{fa.appName}</h1>
      {loadFailed ? (
        <StateMessage tone="error" title={fa.projects.loadFailed} action={<Button onClick={() => router.refresh()}>{fa.common.retry}</Button>} />
      ) : (
        <StateMessage title={fa.projects.emptyTitle} action={<Button onClick={() => setCreating(true)}>{fa.projects.new}</Button>}>
          {fa.projects.emptyHint}
        </StateMessage>
      )}
      <CreateProjectDialog open={creating} onOpenChange={setCreating} onCreated={(project) => router.push(`/projects/${project.id}`)} />
    </main>
  );
}
