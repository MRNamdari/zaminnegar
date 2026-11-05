"use client";

import ParcelsTable, {
  Parcel,
} from "@/app/components/dashboard/parcels/ParcelsTable";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";
import { parcelMockData } from "./ParcelMockData";
import { Dialog } from "@/app/components/Dialog";
import ParcelFormCreate from "@/app/components/dashboard/parcels/ParcelsFormCreate";
import ParcelsFormUpdate from "@/app/components/dashboard/parcels/ParcelsFormUpdate";
import { UpdateParcelFormValues } from "@/app/components/dashboard/parcels/schema/ParcelsUpdate.schema";

export default function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [parcels, setParcels] = useState(parcelMockData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const filteredParcels = parcels.filter((parcel) =>
    parcel.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddParcel = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenUpdateModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateParcel = (values: UpdateParcelFormValues) => {
    if (!selectedParcel) return;

    setParcels((prev) =>
      prev.map((parcel) =>
        parcel.id === selectedParcel.id
          ? {
              ...parcel,
              name: values.nameParcel,
              block: values.nameBlock,
              status: values.parcelStatus,
            }
          : parcel,
      ),
    );

    setIsUpdateModalOpen(false);
    setSelectedParcel(null);
  };

  const handleDelete = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (!selectedParcel) return;

    setParcels((prev) =>
      prev.filter((parcel) => parcel.id !== selectedParcel.id),
    );

    setIsDeleteModalOpen(false);
    setSelectedParcel(null);
  };
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
            onClick={handleAddParcel}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن قطعه</span>
          </button>
        </div>

        <ParcelsTable
          data={filteredParcels as any}
          onDelete={handleDelete}
          onEdit={handleOpenUpdateModal}
          onRowClick={console.log}
          searchValue={searchValue}
        />

        <Dialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          title="افزودن قطعه"
          description="اطلاعات قطعه جدید را وارد کنید"
          className="text-white"
        >
          <ParcelFormCreate
            onSubmit={() => setIsAddModalOpen(false)}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Dialog>

        <Dialog
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          title="ویرایش قطعه"
          description="اطلاعات قطعه را ویرایش کنید"
          className="text-white"
        >
          {selectedParcel && (
            <ParcelsFormUpdate
              parcel={selectedParcel}
              onSubmit={handleUpdateParcel}
              onCancel={() => {
                setIsUpdateModalOpen(false);
                setSelectedParcel(null);
              }}
            />
          )}
        </Dialog>
        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={(open) => {
            setIsDeleteModalOpen(open);

            if (!open) {
              setSelectedParcel(null);
            }
          }}
          title="حذف قطعه"
          description="آیا از حذف این قطعه اطمینان دارید؟"
          className="text-white"
        >
          {selectedParcel && (
            <div className="flex flex-col gap-5 mt-4">
              <p className="text-sm text-slate-300">
                آیا مطمئن هستید که می‌خواهید قطعه
                <span className="text-white font-semibold mx-1">
                  {selectedParcel.name}
                </span>
                را حذف کنید؟
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedParcel(null);
                  }}
                  className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
                >
                  حذف قطعه
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}
