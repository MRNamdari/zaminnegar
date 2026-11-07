"use client";

import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";

import { AddRegionDialog } from "@/app/components/dashboard/regions/AddRegionDialog";
import { RegionFormUpdate } from "@/app/components/dashboard/regions/updateRegionDialog";
import { DeleteRegionDialog } from "@/app/components/dashboard/regions/DeleteRegionDialog";

import RegionsTable from "@/app/components/dashboard/regions/RegionsTable";

import { IRegion } from "@/app/features/regions/interface";
import { UpdateRegionFormValues1 } from "@/app/components/dashboard/regions/schema/RegionUpdate.schema";

import { regionMockData } from "./mockData";

export default function RegionsPage() {
  const [regions, setRegions] = useState<IRegion[]>(regionMockData);

  const [searchValue, setSearchValue] = useState("");

  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const [isDeletingRegion, setIsDeletingRegion] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState<IRegion | null>(null);

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );

  // Edit Region
  const handleEditRegion = (region: IRegion) => {
    setSelectedRegion(region);
    setIsEditingRegion(true);
  };

  const handleUpdateRegion = (values: UpdateRegionFormValues1) => {
    if (!selectedRegion) return;

    setRegions((prev) =>
      prev.map((region) =>
        region.id === selectedRegion.id
          ? { ...region, ...values }
          : region,
      ),
    );

    setIsEditingRegion(false);
    setSelectedRegion(null);
  };

  // Delete Region
  const handleDeleteRegion = (region: IRegion) => {
    setSelectedRegion(region);
    setIsDeletingRegion(true);
  };

  const confirmDeleteRegion = () => {
    if (!selectedRegion) return;

    setRegions((prev) =>
      prev.filter((region) => region.id !== selectedRegion.id),
    );

    setIsDeletingRegion(false);
    setSelectedRegion(null);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">

        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          منطقه ها
        </h2>

        {/* Search & Add */}
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
                className="w-full py-2.5 px-3 text-sm text-foreground border-0 outline-none transition placeholder:text-foreground-muted"
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
            onClick={() => setIsAddingRegion(true)}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن منطقه</span>
          </button>

        </div>

        {/* Regions Table */}
        <RegionsTable
          data={filteredRegions as any}
          onDelete={handleDeleteRegion}
          onEdit={handleEditRegion}
          onRowClick={console.log}
          searchValue={searchValue}
        />

        {/* Add Region Dialog */}
        <AddRegionDialog
          open={isAddingRegion}
          onOpenChange={setIsAddingRegion}
          title="افزودن منطقه"
          description="اطلاعات منطقه جدید را وارد کنید"
          className="text-white"
        />

        {/* Update Region Dialog */}
        {selectedRegion && (
          <RegionFormUpdate
            open={isEditingRegion}
            onOpenChange={(open) => {
              setIsEditingRegion(open);

              if (!open) {
                setSelectedRegion(null);
              }
            }}
            region={selectedRegion}
            onSubmit={handleUpdateRegion}
            title="ویرایش منطقه"
            description="اطلاعات منطقه را ویرایش کنید"
            className="text-white"
          />
        )}

        {/* Delete Region Dialog */}
        {selectedRegion && (
          <DeleteRegionDialog
            open={isDeletingRegion}
            onOpenChange={(open) => {
              setIsDeletingRegion(open);

              if (!open) {
                setSelectedRegion(null);
              }
            }}
            region={selectedRegion}
            onConfirm={confirmDeleteRegion}
            title="حذف منطقه"
            description="آیا از حذف این منطقه اطمینان دارید؟"
            className="text-white"
          />
        )}

      </div>
    </div>
  );
}