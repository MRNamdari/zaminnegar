"use client";

import { useState } from "react";
import type { Owner } from "./OwnersTable";
import { Dialog } from "@/app/components/Dialog";
import { FiEdit2 } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import { faNum, toPersianNumber } from "@/app/util";

interface OwnerInformationProps {
  owner: Owner;
}

export default function OwnersInformation({ owner }: OwnerInformationProps) {
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
            <span className="text-sm">
              {faNum(ownerInfo.nationalCode)}
            </span>
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
            <span className="text-sm">
              {faNum(ownerInfo.address)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleEdit}
            className="py-2 w-full mx-auto bg-action-primary hover:bg-action-primary-hover rounded-md cursor-pointer transition duration-300 flex justify-center items-center gap-2"
          >
            <FiEdit2 size={14} />
            ویرایش اطلاعات
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
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-4">
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm mb-2">نام و نام‌خانوادگی</label>
                <input
                  type="text"
                  value={editedOwner.name}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
                  required
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm mb-2">نام پدر</label>
                <input
                  type="text"
                  value={editedOwner.fatherName}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      fatherName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm mb-2">کد ملی</label>
                <input
                  type="text"
                  value={faNum(editedOwner.nationalCode)}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      nationalCode: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
                  required
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm mb-2">شماره تماس</label>
                <input
                  type="tel"
                  value={faNum(editedOwner.phoneNumber)}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none text-right"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm mb-2">مساحت کل</label>
                <input
                  disabled
                  type="text"
                  min="0"
                  step="0.1"
                  value={faNum(editedOwner.totalArea)}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      totalArea: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
                  required
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm mb-2">تعداد قطعات</label>
                <input
                  disabled
                  type="text"
                  min="0"
                  value={faNum(editedOwner.parcelCount)}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      parcelCount: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">وضعیت مالک</label>

              <div className="relative">
                <select
                  value={editedOwner.status}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      status: e.target.value as Owner["status"],
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="فعال">فعال</option>
                  <option value="غیر فعال">غیر فعال</option>
                </select>

                <IoChevronDown
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">آدرس</label>
              <textarea
                value={faNum(editedOwner.address)}
                onChange={(e) =>
                  setEditedOwner({
                    ...editedOwner,
                    address: e.target.value,
                  })
                }
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none resize-none"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
