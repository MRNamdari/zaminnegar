"use client";
import AddParcelDialog from "@/app/components/dashboard/parcels/AddParcelDialog";
import ParcelsTable from "@/app/components/dashboard/parcels/ParcelsTable";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";
import { parcelMockData } from "./ParcelMockData";

export default function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [isAddingParcel, setIsAddingParcel] = useState(false);
  const filteredParcels = parcelMockData.filter((parcel) =>
    parcel.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          قطعه ها
        </h2>
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو منطقه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی منطقه..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full py-2.5 px-3 text-sm text-foreground border-0  outline-none transition placeholder:text-foreground-muted "
              />
              <button
                type="submit"
                aria-label="جستجو"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition duration-300 focus:outline-none cursor-pointer"
              >
                <CgSearch className="text-action-primary text-lg" />
              </button>
            </search>
          </form>
          <button
            onClick={() => setIsAddingParcel(true)}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن قطعه</span>
          </button>
        </div>
        <ParcelsTable
          data={filteredParcels as any}
          onDelete={console.log}
          onEdit={console.log}
          onRowClick={console.log}
          searchValue={searchValue}
        />
        <AddParcelDialog
            open={isAddingParcel}
            onOpenChange={(open)=> setIsAddingParcel(open)}
            title="افزودن قطعه"
            description="اطلاعات قطعه جدید را وارد کنید"
            className="text-white"
        />
      </div>
    </div>
  );
}
