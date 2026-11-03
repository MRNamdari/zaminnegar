"use client";

import { notFound } from "next/navigation";
import { initialOwners } from "@/app/(dashboard)/mockData";
import { BackButton } from "@/app/components/dashboard/Backbutton";
import OwnersInformation from "@/app/components/dashboard/owners/OwnersInformation";
import ParcelsTable from "@/app/components/dashboard/parcels/ParcelsTable";
import { IParcel } from "@/app/features/parcels/interface";
import { use } from "react";
import { parcelMockData } from "../../parcels/ParcelMockData";

interface Props {
  params: Promise<{ id: string }>;
}

export default function OwnerDetailsPage({ params }: Props) {
  const { id } = use(params);



  const owner = initialOwners.find((item) => item.id === id);
console.log(owner);
  if (!owner) {
    notFound();
  }

  const filteredParcels = parcelMockData.filter((parcel) =>
    parcel.owners?.some(
      (parcelOwner) => parcelOwner.owner?.name === owner.name,
    ),
  );
  
  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-slate-400 py-3.5 rounded-full flex items-center justify-center">
              <span className="font-black text-blue-950 -mt-1 text-xl">
                {owner.name?.trim().charAt(0) || "؟"}
              </span>
            </div>
            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات مالک {owner.name}
            </h2>
            <div
              className={`font-normal px-3 py-px rounded-sm ${owner.status === "فعال" ? "bg-map-green text-surface" : "bg-surface-muted text-foreground"}`}
            >
              {owner.status}
            </div>
          </div>
          <BackButton />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <OwnersInformation owner={owner} />
          <div className="flex flex-col gap-3">
            <h3>لیست قطعات</h3>
            <ParcelsTable
                      data={filteredParcels as any}
                      onDelete={console.log}
                      onEdit={console.log}
                      onRowClick={console.log}
                      searchValue={""}
                    />
          </div>
        </div>
      </div>
    </div>
  );
}
