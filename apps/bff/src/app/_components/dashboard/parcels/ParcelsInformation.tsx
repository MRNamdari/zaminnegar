'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IParcel } from '@/app/features/parcels/interface';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { Dialog } from '@/app/_components/Dialog';
import ParcelsFormUpdate from '@/app/_components/dashboard/parcels/ParcelsFormUpdate';
import { UpdateParcelFormValues } from '@/app/_components/dashboard/parcels/schema/ParcelsUpdate.schema';

interface ParcelInformationProps {
  parcel: IParcel;
}

export default function ParcelsInformation({ parcel }: ParcelInformationProps) {
  const router = useRouter();
  const [currentParcel, setCurrentParcel] = useState<IParcel>(parcel);
  const [activeTab, setActiveTab] = useState<'info' | 'details'>('info');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdateParcel = (values: UpdateParcelFormValues) => {
    setCurrentParcel((prev) => ({
      ...prev,
      name: values.nameParcel,
      block: values.nameBlock,
      status: values.parcelStatus,
    }));

    setIsUpdateModalOpen(false);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    router.push('/parcels');
  };

  return (
    <div className="w-1/2">
      <div className="w-full flex mb-2">
        <button
          onClick={() => setActiveTab('info')}
          disabled={activeTab === 'info'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          اطلاعات کلی
        </button>

        <button
          onClick={() => setActiveTab('details')}
          disabled={activeTab === 'details'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          مالکین
        </button>

        <Link
          href="/map"
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300"
        >
          نقشه
        </Link>
      </div>

      <div className="w-full">
        <div
          className="flex flex-col gap-3 aria-hidden:hidden"
          aria-hidden={activeTab !== 'info'}
        >
          <div className="bg-surface-raised rounded-md p-4">
            <div className="flex justify-between px-1 pb-3.5 border-b border-border">
              <span className="text-sm">کد قطعه:</span>
              <span className="text-sm">{currentParcel.name}</span>
            </div>

            <div className="flex justify-between px-1 py-3.5 border-b border-border">
              <span className="text-sm">بلوک:</span>
              <span className="text-sm">
                {currentParcel.block ?? currentParcel.blockId}
              </span>
            </div>

            <div className="flex justify-between px-1 pt-3.5">
              <span className="text-sm">مساحت:</span>
              <span className="text-sm">{currentParcel.areaM2} متر مربع</span>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
            >
              <FiEdit2 size={14} />
              ویرایش
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-1/2 p-3 bg-action-error text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
            >
              <FiTrash2 size={14} />
              حذف
            </button>
          </div>
        </div>
        <div
          aria-hidden={activeTab !== 'details'}
          className="aria-hidden:hidden"
        >
          <div className="flex flex-col gap-3">
            {currentParcel.owners?.map((o) => (
              <div key={o.ownerId} className="bg-surface-raised rounded-md p-4">
                <div className="flex justify-between px-1 pb-3.5 border-b border-border">
                  <span className="text-sm">نام مالک:</span>

                  <Link
                    href={`/owners/${o.owner?.id}`}
                    className="inline-block h-full text-blue-400 hover:underline underline-offset-4"
                  >
                    {o.owner?.name}
                  </Link>
                </div>

                <div className="flex justify-between px-1 pt-3.5">
                  <span className="text-sm">درصد سهم:</span>
                  <span className="text-sm">{o.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        title="ویرایش قطعه"
        description="اطلاعات قطعه را ویرایش کنید"
        className="text-white"
      >
        <ParcelsFormUpdate
          parcel={currentParcel}
          onSubmit={handleUpdateParcel}
          onCancel={() => setIsUpdateModalOpen(false)}
        />
      </Dialog>
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="حذف قطعه"
        description="آیا از حذف این قطعه اطمینان دارید؟"
        className="text-white"
      >
        <div className="flex flex-col gap-5 mt-4">
          <p className="text-sm text-slate-300">
            آیا مطمئن هستید که می‌خواهید قطعه
            <span className="text-white font-semibold mx-1">
              {currentParcel.name}
            </span>
            را حذف کنید؟
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
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
      </Dialog>
    </div>
  );
}
