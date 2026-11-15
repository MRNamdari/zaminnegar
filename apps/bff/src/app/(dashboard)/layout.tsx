import { Suspense } from 'react';
import AuthenticatedDashboard from '../_components/AuthenticatedDashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

function SkeletonDashboard() {
  return (
    <div className="max-h-svh h-full grid grid-rows-[auto_1fr] grid-cols-12">
      <div className="col-span-12">
      <header className="grid grid-cols-3 items-center border-b border-border p-4"></header>
      </div>
      <main className="col-span-11 h-full overflow-y-auto"></main>
      <aside className="w-full border-s border-border"></aside>
    </div>
  );
}
