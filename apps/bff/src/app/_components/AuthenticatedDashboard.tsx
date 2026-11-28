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
      <div className='grid grid-rows-[auto_1fr] grid-cols-[1fr_auto] h-screen'>
        <div className='col-span-1 max-h-25 h-full'><DashboardHeader/></div>
        <DashboardNavigation/>
        <main className='row-span-1 h-full overflow-y-auto'>{children}</main>
      </div>
    </>
  );
}
