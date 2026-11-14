'use client';

import { useState } from 'react';
import { Block } from './BlocksTable';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/app/_components/Dialog';
import Link from 'next/link';
import { toPersianNumber } from '@/app/util';
import ParcelsTable, { Parcel } from '../parcels/ParcelsTable';
import { parcelMockData } from '@/app/(dashboard)/parcels/ParcelMockData';
import UpdateBlockForm from './BlockFormUpdate';
import { UpdateBlockFormValues } from './schemas/BlockUpdate.schema';
import ParcelsFormUpdate from '../parcels/ParcelsFormUpdate';
import { UpdateParcelFormValues } from '../parcels/schema/ParcelsUpdate.schema';

interface BlockInformationProps {
  block: Block;
}

export default function BlockInformation({ block }: BlockInformationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'parcels'>('info');
  const [currentBlock, setCurrentBlock] = useState<Block>(block);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [parcels, setParcels] = useState(parcelMockData);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isDeleteBlockModalOpen, setIsDeleteBlockModalOpen] = useState(false);
  const [isDeleteParcelModalOpen, setIsDeleteParcelModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateModalParcelOpen, setIsUpdateModalParcelOpen] = useState(false);

  const filteredParcels = parcels.filter(
    (parcel) => parcel.blockId === currentBlock.id,
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

  const handleOpenUpdateBlockModal = () => {
    setSelectedBlock(currentBlock);
    setIsUpdateModalOpen(true);
  };

  const handleOpenUpdateModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsUpdateModalParcelOpen(true);
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

    setIsUpdateModalParcelOpen(false);
    setSelectedParcel(null);
  };

  const handleDelete = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsDeleteParcelModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedParcel) return;

    setParcels((prev) =>
      prev.filter((parcel) => parcel.id !== selectedParcel.id),
    );

    setIsDeleteParcelModalOpen(false);
    setSelectedParcel(null);
  };

  return (
    <div className="w-full">
      <div className="w-full flex mb-2">
        <button
          onClick={() => setActiveTab('info')}
          disabled={activeTab === 'info'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          اطلاعات کلی
        </button>

        <button
          onClick={() => setActiveTab('parcels')}
          disabled={activeTab === 'parcels'}
          className="w-1/3 py-2.5 border-b border-slate-200/10 rounded-t-md cursor-pointer text-center hover:bg-blue-500/20 transition duration-300 disabled:border-b-blue-500 disabled:border-b-2"
        >
          قطعات
        </button>

        <Link
          href={{
            pathname: '/map/',
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
          aria-hidden={activeTab !== 'info'}
        >
          <div className="flex flex-col gap-3 w-1/2">
            <div className="bg-surface-raised rounded-md p-4">
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
                onClick={handleOpenUpdateBlockModal}
                className="w-1/2 p-3 bg-action-primary text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
              >
                <FiEdit2 size={14} />
                ویرایش
              </button>

              <button
                onClick={() => setIsDeleteBlockModalOpen(true)}
                className="w-1/2 p-3 bg-action-error text-white rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
              >
                <FiTrash2 size={14} />
                حذف
              </button>
            </div>
          </div>

          <div className="w-1/2 rounded-2xl overflow-hidden"></div>
        </div>
        <div
          aria-hidden={activeTab !== 'parcels'}
          className="aria-hidden:hidden"
        >
          <ParcelsTable
            data={filteredParcels as any}
            onDelete={handleDelete}
            onEdit={handleOpenUpdateModal}
            onRowClick={console.log}
            searchValue=""
          />
        </div>
      </div>

      {/* Delete block dialog */}
      <Dialog
        open={isDeleteBlockModalOpen}
        onOpenChange={setIsDeleteBlockModalOpen}
        title="حذف بلوک"
        description="آیا از حذف این بلوک اطمینان دارید؟"
        className="text-white"
      >
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteBlockModalOpen(false)}
            className="w-1/2 p-3 rounded-md bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <button
            onClick={() => router.push('/blocks')}
            className="w-1/2 p-3 rounded-md bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            حذف بلوک
          </button>
        </div>
      </Dialog>

      {/* Update block dialog */}
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={(open) => {
          setIsUpdateModalOpen(open);

          if (!open) {
            setSelectedBlock(null);
          }
        }}
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

      {/* Update parcel dialog */}
      <Dialog
        open={isUpdateModalParcelOpen}
        onOpenChange={(open) => {
          setIsUpdateModalParcelOpen(open);

          if (!open) {
            setSelectedParcel(null);
          }
        }}
        title="ویرایش قطعه"
        description="اطلاعات قطعه را ویرایش کنید"
        className="text-white"
      >
        {selectedParcel && (
          <ParcelsFormUpdate
            owners={[]}
            parcel={selectedParcel}
            onSubmit={handleUpdateParcel}
            onCancel={() => {
              setIsUpdateModalParcelOpen(false);
              setSelectedParcel(null);
            }}
          />
        )}
      </Dialog>

      {/* Delete parcel dialog */}
      <Dialog
        open={isDeleteParcelModalOpen}
        onOpenChange={(open) => {
          setIsDeleteParcelModalOpen(open);

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
                  setIsDeleteParcelModalOpen(false);
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
  );
}
