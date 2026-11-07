import DashboardNavigation from "../components/dashboard/DashboardNavigation";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { QueryProviders } from "../_lib/QueryProviders";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProviders>
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
