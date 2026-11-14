'use client';

import { notFound } from 'next/navigation';
import { useState, use } from 'react';
import { initialOwners } from '@/app/(dashboard)/mockData';
import { parcelMockData } from '../../parcels/ParcelMockData';
import { BackButton } from '@/app/_components/dashboard/Backbutton';
import OwnersInformation from '@/app/_components/dashboard/owners/OwnersInformation';
import ParcelsTable, {
  Parcel,
} from '@/app/_components/dashboard/parcels/ParcelsTable';
import type { Owner } from '@/app/_components/dashboard/owners/OwnersTable';
import { Dialog } from '@/app/_components/Dialog';
import ParcelsFormUpdate from '@/app/_components/dashboard/parcels/ParcelsFormUpdate';
import { UpdateParcelFormValues } from '@/app/_components/dashboard/parcels/schema/ParcelsUpdate.schema';

interface Props {
  params: Promise<{ id: string }>;
}

export default function OwnerDetailsPage({ params }: Props) {
  const { id } = use(params);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [parcels, setParcels] = useState(parcelMockData);
  const initialOwner = initialOwners.find((item) => item.id === id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!initialOwner) {
    notFound();
  }

  const [owner, setOwner] = useState<Owner>(initialOwner);

  const handleUpdateOwner = (updatedOwner: Owner) => {
    setOwner(updatedOwner);
  };

  const filteredParcels = parcels.filter((parcel) =>
    parcel.owners?.some(
      (parcelOwner) => parcelOwner.owner?.name === owner.name,
    ),
  );

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
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-slate-400 py-3.5 rounded-full flex items-center justify-center">
              <span className="font-black text-blue-950 -mt-1 text-xl">
                {owner.name.trim().charAt(0) || '؟'}
              </span>
            </div>

            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات مالک {owner.name}
            </h2>

            <div
              className={`font-normal px-3 py-px rounded-sm ${
                owner.status === 'فعال'
                  ? 'bg-map-green text-surface'
                  : 'bg-surface-muted text-foreground'
              }`}
            >
              {owner.status}
            </div>
          </div>

          <BackButton />
        </div>

        <div className="flex flex-col gap-4 w-full">
          <OwnersInformation owner={owner} onUpdate={handleUpdateOwner} />

          <div className="flex flex-col gap-3">
            <h3>لیست قطعات</h3>

            <ParcelsTable
              data={filteredParcels as any}
              onDelete={handleDelete}
              onEdit={handleOpenUpdateModal}
              onRowClick={console.log}
              searchValue=""
            />
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
  );
}
