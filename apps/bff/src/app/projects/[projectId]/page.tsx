import { getMapConfig } from '@/features/map/config/map-config';
import { WorkspaceShell } from '@/features/workspace/components/workspace-shell';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

/** Workspace of one project: parcel list, interactive map and properties panel. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  return <WorkspaceShell projectId={projectId} mapConfig={getMapConfig()} />;
}
