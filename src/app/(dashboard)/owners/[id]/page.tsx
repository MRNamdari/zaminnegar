import { notFound } from "next/navigation";
import { initialOwners } from "@/app/(dashboard)/mockData";
import { BackButton } from "@/app/components/dashboard/Backbutton";
import OwnersInformation from "@/app/components/dashboard/owners/OwnersInformation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OwnerDetailsPage({ params }: Props) {
  const { id } = await params;

  const owner = initialOwners.find((item) => item.id === id);
console.log(owner);
  if (!owner) {
    notFound();
  }
  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-slate-400 py-3.5 rounded-full"></div>
            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات مالک {owner.name}
            </h2>
            <div
              className={`font-normal px-3 py-px rounded-sm ${owner.status === "فعال" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {owner.status}
            </div>
          </div>
          <BackButton />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <OwnersInformation owner={owner} />
          <div className="bg-slate-200/5 w-full h-50 p-4">
            <h3>لیست قطعات</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
