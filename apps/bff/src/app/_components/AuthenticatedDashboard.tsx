import DashboardNavigation from '../_components/dashboard/DashboardNavigation';
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
      {/* <div className="max-h-svh h-full grid grid-rows-[auto_1fr] grid-cols-12">
        <DashboardNavigation />
        <main className="col-span-11 h-full overflow-y-auto">{children}</main>
        <div className="col-span-12">DashboardHeader</div>
      </div> */}
      <div className='grid grid-cols-[1fr_auto] h-svh'>
        <div>
          <header className='min-h-20'>Header</header>
          <main className='h-full'>{children}</main>
        </div>
        <DashboardNavigation/>
      </div>
    </>
  );
}
