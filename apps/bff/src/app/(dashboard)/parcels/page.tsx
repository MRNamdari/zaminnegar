'use client';

import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';

import ParcelsTable, {
  Parcel,
} from '@/app/_components/dashboard/parcels/ParcelsTable';

import ParcelsFormCreate, {
  ParcelCreatePayload,
} from '@/app/_components/dashboard/parcels/ParcelsFormCreate';

import ParcelsFormUpdate from '@/app/_components/dashboard/parcels/ParcelsFormUpdate';

import { UpdateParcelFormValues } from '@/app/_components/dashboard/parcels/schema/ParcelsUpdate.schema';

import { Dialog } from '@/app/_components/Dialog';

import { parcelMockData } from './ParcelMockData';
import { initialOwners } from '../mockData';

export default function Page() {
  const [searchValue, setSearchValue] = useState('');

  const [parcels, setParcels] = useState<Parcel[]>(parcelMockData);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // باز کردن فرم افزودن قطعه
  const handleAddParcel = () => {
    setIsAddModalOpen(true);
  };

  // ثبت قطعه جدید
  const handleCreateParcel = (values: ParcelCreatePayload) => {
    const template = parcels[0];

    // برای ساخت قطعه آزمایشی به اطلاعات هندسی نیاز داریم.
    if (!template) {
      console.error('اطلاعات اولیه قطعات برای ساخت قطعه آزمایشی موجود نیست.');
      return;
    }

    const newId = crypto.randomUUID();
    const now = new Date();

    const newParcel: Parcel = {
      ...template,
      id: newId,
      name: values.nameParcel,
      block: template.block,
      status: values.parcelStatus,

      owners: values.owners.map((item) => {
        const owner = initialOwners.find((owner) => owner.id === item.ownerId);

        return {
          parcelId: newId,
          ownerId: item.ownerId,
          share: item.share,
          createdAt: now,
          updatedAt: now,
          owner: owner
            ? {
                id: owner.id,
                name: owner.name,
                phone: owner.phoneNumber,
                createdAt: now,
                updatedAt: now,
              }
            : undefined,
        };
      }),
    };

    setParcels((previous) => [...previous, newParcel]);

    setIsAddModalOpen(false);
  };

  // باز کردن فرم ویرایش
  const handleOpenUpdateModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsUpdateModalOpen(true);
  };

  // ویرایش قطعه
  const handleUpdateParcel = (values: UpdateParcelFormValues) => {
    if (!selectedParcel) return;

    const now = new Date();

    setParcels((previous) =>
      previous.map((parcel) => {
        if (parcel.id !== selectedParcel.id) return parcel;

        return {
          ...parcel,
          name: values.nameParcel,
          status: values.parcelStatus,

          owners: values.owners.map((item) => {
            const owner = initialOwners.find(
              (owner) => owner.id === item.ownerId,
            );

            const existingOwner = parcel.owners?.find(
              (relation) => relation.ownerId === item.ownerId,
            );

            return {
              parcelId: parcel.id,
              ownerId: item.ownerId,
              share: Number(item.share),
              createdAt: existingOwner?.createdAt ?? now,
              updatedAt: now,
              owner: owner
                ? {
                    id: owner.id,
                    name: owner.name,
                    phone: owner.phoneNumber,
                    createdAt: existingOwner?.owner?.createdAt ?? now,
                    updatedAt: now,
                  }
                : undefined,
            };
          }),
        };
      }),
    );

    setIsUpdateModalOpen(false);
    setSelectedParcel(null);
  };

  // باز کردن پنجره حذف
  const handleDelete = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsDeleteModalOpen(true);
  };

  // تأیید حذف قطعه
  const confirmDelete = () => {
    if (!selectedParcel) return;

    setParcels((previous) =>
      previous.filter((parcel) => parcel.id !== selectedParcel.id),
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

        {/* جستجو و افزودن قطعه */}
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو قطعه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی قطعه..."
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
            type="button"
            onClick={handleAddParcel}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن قطعه</span>
          </button>
        </div>

        {/* جدول قطعات */}
        <ParcelsTable
          data={parcels}
          onDelete={handleDelete}
          onEdit={handleOpenUpdateModal}
          onRowClick={(parcel) => console.log(parcel)}
          searchValue={searchValue}
        />

        {/* فرم افزودن قطعه */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          title="افزودن قطعه"
          description="اطلاعات قطعه جدید را وارد کنید"
          className="text-white"
        >
          <ParcelsFormCreate
            owners={initialOwners}
            onSubmit={handleCreateParcel}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Dialog>

        {/* فرم ویرایش قطعه */}
        <Dialog
          open={isUpdateModalOpen}
          onOpenChange={(open) => {
            setIsUpdateModalOpen(open);

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
              parcel={selectedParcel}
              owners={initialOwners}
              onSubmit={handleUpdateParcel}
              onCancel={() => {
                setIsUpdateModalOpen(false);
                setSelectedParcel(null);
              }}
            />
          )}
        </Dialog>

        {/* پنجره حذف قطعه */}
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
