'use client';

import { useState } from 'react';
import type { Owner } from './OwnersTable';
import { Dialog } from '@/app/_components/Dialog';
import { FiEdit2 } from 'react-icons/fi';
import { faNum, toPersianNumber } from '@/app/util';
import OwnersFormUpdate from './OwnersFormUpdate';

interface OwnerInformationProps {
  owner: Owner;
  onUpdate: (owner: Owner) => void;
}

export default function OwnersInformation({
  owner,
  onUpdate,
}: OwnerInformationProps) {
  const [ownerInfo, setOwnerInfo] = useState<Owner>(owner);
  const [isOpen, setIsOpen] = useState(false);
  const [editedOwner, setEditedOwner] = useState<Owner | null>(null);

  const handleEdit = () => {
    setEditedOwner({ ...ownerInfo });
    setIsOpen(true);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editedOwner) return;

    setOwnerInfo(editedOwner);
    setIsOpen(false);
    setEditedOwner(null);
  };

  return (
    <>
      <div className="bg-surface-raised rounded-md p-4 w-full flex">
        <div className="w-1/3 h-full pl-2">
          <div className="flex justify-between px-1 pb-4.5 border-b border-border">
            <span className="text-sm">نام و نام‌خانوادگی:</span>
            <span className="text-sm">{ownerInfo.name}</span>
          </div>

          <div className="flex justify-between px-1 py-4.5 border-b border-border">
            <span className="text-sm">نام پدر:</span>
            <span className="text-sm">{ownerInfo.fatherName}</span>
          </div>

          <div className="flex justify-between px-1 pt-4.5">
            <span className="text-sm">کد ملی:</span>
            <span className="text-sm">{faNum(ownerInfo.nationalCode)}</span>
          </div>
        </div>

        <div className="w-1/3 h-full px-2 border-x-2 border-slate-200/10">
          <div className="flex justify-between px-1 pb-4.5 border-b border-border">
            <span className="text-sm">شماره تماس:</span>
            <span className="text-sm">{faNum(ownerInfo.phoneNumber)}</span>
          </div>

          <div className="flex justify-between px-1 py-4.5 border-b border-border">
            <span className="text-sm">مساحت کل:</span>
            <span className="text-sm">
              {toPersianNumber(ownerInfo.totalArea)}
            </span>
          </div>

          <div className="flex justify-between px-1 pt-4.5">
            <span className="text-sm">تعداد قطعات:</span>
            <span className="text-sm">
              {toPersianNumber(ownerInfo.parcelCount)}
            </span>
          </div>
        </div>

        <div className="w-1/3 max-h-full pr-2 flex flex-col justify-between">
          <div className="flex flex-col gap-2 justify-between px-1">
            <span className="text-sm">آدرس:</span>
            <span className="text-sm">{faNum(ownerInfo.address)}</span>
          </div>

          <button
            type="button"
            onClick={handleEdit}
            className="py-2.5 w-full mx-auto bg-action-primary rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
          >
            <FiEdit2 size={14} className="text-white" />
            <span className="text-sm text-white">ویرایش اطلاعات</span>
          </button>
        </div>
      </div>

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
              setOwnerInfo(updatedOwner);
              onUpdate(updatedOwner);

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
    </>
  );
}
