import { notFound } from "next/navigation"
import { parcelMockData } from "@/app/(dashboard)/parcels/ParcelMockData"
import { BackButton } from "@/app/components/dashboard/Backbutton"
import ParcelsInformation from "@/app/components/dashboard/parcels/ParcelsInformation"

interface Props {
  params: Promise<{ id: string }>;
}
export default async function page({ params }: Props) {
  const { id } = await params;

  const parcel = parcelMockData.find((item) => item.id === id);

  if (!parcel) {
    notFound();
  }
  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-emerald-700 py-3.5"></div>
            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات قطعه {id}
            </h2>
            <div className="font-normal bg-action-warning/90 text-surface px-3 py-px rounded-sm">
              <span>بلوک: </span>
              {parcel.blockId}
            </div>
          </div>
          <BackButton />
        </div>
        <div className="flex gap-4 w-full">
          <ParcelsInformation parcel={parcel} />
          <div className="w-1/2 rounded-2xl overflow-hidden">
          </div>
        </div>
      </div>
    </div>
  )
}
