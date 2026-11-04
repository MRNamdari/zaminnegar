"use client";

import { useState } from "react";
import { Block } from "./BlocksTable";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Dialog } from "@/app/components/Dialog";
import Link from "next/link";
import { toPersianNumber } from "@/app/util";
import ParcelsTable from "../parcels/ParcelsTable";
import { parcelMockData } from "@/app/(dashboard)/parcels/ParcelMockData";
import { MapEditor, MapEditorProvider } from "@/app/features/map-editor";
import UpdateBlockForm from "./BlockFormUpdate";
import { UpdateBlockFormValues } from "./schemas/BlockUpdate.schema";

interface BlockInformationProps {
  block: Block;
}

export default function BlockInformation({block} :BlockInformationProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info'|'parcels'>('info')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [currentBlock, setCurrentBlock] = useState<Block>(block);

    const filteredParcels = parcelMockData.filter(
      (parcel) => parcel.block?.id === block.id,
    );
    
      const handleUpdateBlock = (values: UpdateBlockFormValues) => {
        const updatedBlock: Block = {
          ...currentBlock,
          code: values.blockCode,
          region: values.blockAreaName,
          status: values.blockStatus,
        };

        setCurrentBlock(updatedBlock);

        setIsUpdateModalOpen(false);
        setSelectedBlock(null);
      };

  return (
    <div className="w-full  ">
      <MapEditorProvider>
        <div className="w-full flex mb-2">
          <button
            onClick={() => setActiveTab("info")}
            disabled={activeTab === "info"}
            className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
          >
            اطلاعات کلی
          </button>
          <button
            onClick={() => setActiveTab("parcels")}
            disabled={activeTab === "parcels"}
            className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
          >
            قطعات
          </button>
          <Link
            href={{
              pathname: `/map/`,
              query: {
                block: currentBlock.code,
              },
            }}
            className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300"
          >
            نقشه
          </Link>
        </div>
        <div className="w-full">
          <div
            className="flex gap-3 aria-hidden:hidden"
            aria-hidden={activeTab !== "info"}
          >
            <div className="flex flex-col gap-3 w-1/2">
              <div className=" bg-surface-raised rounded-md p-4">
                <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                  <span className="text-sm">کد بلوک:</span>
                  <span className="text-sm">{currentBlock.code}</span>
                </div>
                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">تعداد قطعات:</span>
                  <span className="text-sm">
                    {toPersianNumber(currentBlock.parcelCount)}
                  </span>
                </div>
                <div className="flex justify-between px-1 py-3.5 border-b border-border">
                  <span className="text-sm">منطقه:</span>
                  <span className="text-sm">{currentBlock.region}</span>
                </div>
                <div className="flex justify-between px-1 pt-3.5">
                  <span className="text-sm">مساحت:</span>
                  <span className="text-sm">{toPersianNumber(2.7)} هکتار</span>
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedBlock(currentBlock);
                    setIsUpdateModalOpen(true);
                  }}
                  className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
                >
                  <FiEdit2 size={14} />
                  ویرایش
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-1/2 p-3 bg-action-error text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
                >
                  <FiTrash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
            <div className="w-1/2 rounded-2xl overflow-hidden">
              <MapEditor
                controls={false}
                toolbar={false}
                miniMap={false}
                viewModeToggle={false}
              />
            </div>
          </div>
          <div
            aria-hidden={activeTab !== "parcels"}
            className="aria-hidden:hidden"
          >
            <ParcelsTable
              data={filteredParcels as any}
              onDelete={console.log}
              onEdit={console.log}
              onRowClick={console.log}
              searchValue={""}
            />
          </div>
        </div>
      </MapEditorProvider>
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="حذف بلوک"
        description="آیا از حذف این بلوک اطمینان دارید؟"
        className="text-white"
      >
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="w-1/2 p-3 rounded-md bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <button
            onClick={() => router.push("/blocks")}
            className="w-1/2 p-3 rounded-md bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            حذف بلوک
          </button>
        </div>
      </Dialog>
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        title="ویرایش بلوک"
        description="اطلاعات بلوک را ویرایش کنید"
        className="text-white"
      >
        {selectedBlock && (
          <UpdateBlockForm
            block={selectedBlock}
            onSubmit={handleUpdateBlock}
            onCancel={() => {
              setIsUpdateModalOpen(false);
              setSelectedBlock(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
