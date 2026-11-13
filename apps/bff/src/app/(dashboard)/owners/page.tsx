'use client';

import OwnersTable, {
  Owner,
} from '@/app/_components/dashboard/owners/OwnersTable';

import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { Dialog } from '@/app/_components/Dialog';
import { initialOwners } from '../mockData';
import { CgSearch } from 'react-icons/cg';
import CreateOwnerForm from '@/app/_components/dashboard/owners/OwnersFormCreate';
import { OwnerFormValues } from '@/app/_components/dashboard/owners/schemas/OwnersCreate.schema';
import OwnersFormUpdate from '@/app/_components/dashboard/owners/OwnersFormUpdate';

interface OwnerInformationProps {
  owner: Owner;
  onUpdate: (owner: Owner) => void;
}

export default function OwnersPage({ owner, onUpdate }: OwnerInformationProps) {
  const [searchValue, setSearchValue] = useState('');
  const [owners, setOwners] = useState<Owner[]>(initialOwners);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editedOwner, setEditedOwner] = useState<Owner | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<Owner>(owner);

  const handleAddOwner = (values: OwnerFormValues) => {
    console.log('Owner Values:', values);

    const newOwnerData: Owner = {
      id: String(owners.length + 1),
      ...values,
    };

    setOwners((prevOwners) => [...prevOwners, newOwnerData]);
    setIsAddModalOpen(false);
  };

  const handleDelete = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedOwner) return;

    setOwners((prevOwners) =>
      prevOwners.filter((owner) => owner.id !== selectedOwner.id),
    );

    setIsDeleteModalOpen(false);
    setSelectedOwner(null);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editedOwner) return;

    setOwnerInfo(editedOwner);
    setIsOpen(false);
    setEditedOwner(null);
  };

  const handleEdit = (owner: Owner) => {
    setEditedOwner(owner);
    setIsOpen(true);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          مالکین
        </h2>

        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جستجو
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی مالکین..."
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
            onClick={() => setIsAddModalOpen(true)}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن مالک</span>
          </button>
        </div>

        <OwnersTable
          data={owners}
          searchValue={searchValue}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={console.log}
        />
      </div>

      {/* Add Owner Dialog */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="افزودن مالک"
        description="اطلاعات مالک جدید را وارد کنید"
        className="text-white"
      >
        <CreateOwnerForm
          onSubmit={handleAddOwner}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Dialog>

      {/* Edit Owner Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditedOwner(null);
        }}
        title="ویرایش مالک"
        description="اطلاعات مالک را ویرایش کنید"
        className="text-white"
      >
        {editedOwner && (
          <OwnersFormUpdate
            key={editedOwner.id}
            editedOwner={editedOwner}
            onSubmit={(updatedOwner) => {
              setOwners((prev) =>
                prev.map((owner) =>
                  owner.id === updatedOwner.id ? updatedOwner : owner,
                ),
              );

              setIsOpen(false);
              setEditedOwner(null);
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditedOwner(null);
            }}
          />
        )}
      </Dialog>

      {/* Delete Owner Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);

          if (!open) {
            setSelectedOwner(null);
          }
        }}
        title="حذف مالک"
        description="آیا از حذف این مالک اطمینان دارید؟"
        className="text-white"
      >
        {selectedOwner && (
          <div className="flex flex-col gap-5 mt-4">
            <p className="text-sm text-slate-300">
              آیا مطمئن هستید که می‌خواهید مالک{' '}
              <span className="text-white font-semibold mx-1">
                {selectedOwner.name}
              </span>{' '}
              را حذف کنید؟
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedOwner(null);
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
                حذف مالک
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
