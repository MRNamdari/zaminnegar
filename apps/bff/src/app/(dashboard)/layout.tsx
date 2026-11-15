import DashboardNavigation from '../_components/dashboard/DashboardNavigation';
import DashboardHeader from '../_components/dashboard/DashboardHeader';
import { QueryProviders } from '../_lib/QueryProviders';
import { SessionRenewal } from '../_components/providers/SessionRenewal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProviders>
      <SessionRenewal/>
      <div className="max-h-svh h-full grid grid-rows-[auto_1fr] grid-cols-12">
        <div className="col-span-12">
          <DashboardHeader />
        </div>
        <main className="col-span-11 h-full overflow-y-auto">{children}</main>
        <DashboardNavigation />
      </div>
    </QueryProviders>
  );
}
