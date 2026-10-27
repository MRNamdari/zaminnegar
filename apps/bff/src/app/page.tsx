import { redirect } from 'next/navigation';
import { listProjectsAction } from '@/features/projects/actions/list-projects.action';
import { EmptyProjectsState } from '@/features/projects/components/empty-projects-state';

// The project list changes at any time; never prerender this page.
export const dynamic = 'force-dynamic';

/** Landing page: opens the most recently changed project, or invites the user to create one. */
export default async function HomePage() {
  const result = await listProjectsAction();
  if (!result.ok) return <EmptyProjectsState loadFailed />;
  const [latest] = result.data.items;
  if (latest) redirect(`/projects/${latest.id}`);
  return <EmptyProjectsState />;
}
