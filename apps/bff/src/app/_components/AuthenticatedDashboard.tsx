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
      <div className='grid grid-cols-[1fr_auto] h-svh'>
        <div>
          <header className='min-h-20'><DashboardHeader/></header>
          <main className='h-full'>{children}</main>
        </div>
        <DashboardNavigation/>
      </div>
    </>
  );
}
