"use client";

import { useState } from "react";
import { IParcel } from "@/app/features/parcels/interface";
// import { toPersianNumber } from "@/app/util";
// import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

interface ParcelInformationProps {
  parcel: IParcel;
}
export default function ParcelsInformation({ parcel }: ParcelInformationProps) {
  //   const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "details">("info");
  return (
    <div className="w-1/2">
      <div className="w-full flex mb-2">
        <button
          onClick={() => setActiveTab("info")}
          disabled={activeTab === "info"}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          اطلاعات کلی
        </button>
        <button
          onClick={() => setActiveTab("details")}
          disabled={activeTab === "details"}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          مالکین
        </button>
        <Link
          href={{
            pathname: `/map/`,
            // query: {
            //   block: editedBlock.code,
            // },
          }}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300"
        >
          نقشه
        </Link>
      </div>
      <div className="w-full">
        <div
          className="flex flex-col gap-3 aria-hidden:hidden"
          aria-hidden={activeTab !== "info"}
        >
          <div className=" bg-surface-raised rounded-md p-4">
            <div className="flex justify-between px-1 pb-3.5 border-b border-border">
              <span className="text-sm">کد قطعه:</span>
              <span className="text-sm">{parcel.name}</span>
            </div>
            <div className="flex justify-between px-1 py-3.5 border-b border-border">
              <span className="text-sm">بلوک:</span>
              <span className="text-sm">{parcel.blockId}</span>
            </div>
            <div className="flex justify-between px-1 pt-3.5">
              <span className="text-sm">مساحت:</span>
              <span className="text-sm">{parcel.areaM2} هکتار</span>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <button
              //   onClick={() => {
              //     setEditedBlock(block);
              //     setIsEditModalOpen(true);
              //   }}
              className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
            >
              <FiEdit2 size={14} />
              ویرایش
            </button>
            <button
              //   onClick={() => setIsDeleteModalOpen(true)}
              className="w-1/2 p-3 bg-action-error text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
            >
              <FiTrash2 size={14} />
              حذف
            </button>
          </div>
        </div>
        <div
          aria-hidden={activeTab !== "details"}
          className="aria-hidden:hidden"
        >
          <div className="flex flex-col gap-3">
            {parcel.owners?.map((o) => (
              <div key={o.ownerId} className="bg-surface-raised rounded-md p-4">
                <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                  <span className="text-sm">نام مالک:</span>
                  <Link href={`/owners/${o.owner?.id}`} className="inline-block h-full text-blue-400 hover:underline underline-offset-4">{o.owner?.name}</Link>
                </div>

                <div className="flex justify-between px-1 pt-3.5">
                  <span className="text-sm">درصد سهم:</span>
                  <span className="text-sm">{o.owner?.percentParcel}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <Dialog
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
      </Dialog> */}
      {/* <Dialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="ویرایش بلوک"
        description="اطلاعات بلوک را ویرایش کنید."
        className="text-white"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsEditModalOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="کد بلوک"
              value={editedBlock.code}
              onChange={(e) =>
                setEditedBlock({
                  ...editedBlock,
                  code: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg bg-slate-700 text-white border-border outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative">
              <select
                value={editedBlock.region}
                onChange={(e) =>
                  setEditedBlock({
                    ...editedBlock,
                    region: e.target.value,
                  })
                }
                name="region"
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border-border outline-none appearance-none"
              >
                <option value="" disabled>
                  نام منطقه
                </option>

                <option value="شمال">شمال</option>
                <option value="جنوب">جنوب</option>
                <option value="شرق">شرق</option>
                <option value="غرب">غرب</option>
                <option value="مرکز">مرکز</option>
              </select>

              <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-1/2 p-3 rounded-md bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="w-1/2 p-3 rounded-md bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
            >
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </Dialog> */}
    </div>
  );
}
