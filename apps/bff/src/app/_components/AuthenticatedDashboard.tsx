import DashboardNavigation from '../_components/dashboard/DashboardNavigation';
import DashboardHeader from '../_components/dashboard/DashboardHeader';
import { SessionRenewal } from '../_components/providers/SessionRenewal';
import { requireAuth } from '../_lib/auth/auth';

export default async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <>
      <SessionRenewal />
      <div className="max-h-svh h-full grid grid-rows-[auto_1fr] grid-cols-12">
        <div className="col-span-12">
          {/* <DashboardHeader />  */}
        </div>
        <main className="col-span-11 h-full overflow-y-auto">{children}</main>
        {/* <DashboardNavigation /> */}
      </div>
    </>
  );
}
