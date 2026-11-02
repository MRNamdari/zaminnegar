"use client";

import OwnersTable, {
  Owner,
} from "@/app/components/dashboard/owners/OwnersTable";

import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { Dialog } from "@/app/components/Dialog";
import { IoChevronDown } from "react-icons/io5";
import { toPersianNumber } from "@/app/util";
import { initialOwners } from "../mockData";
import { useRouter } from "next/navigation";
import { CgSearch } from "react-icons/cg";

export default function OwnersPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedOwner, setEditedOwner] = useState<Owner | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOwner, setNewOwner] = useState<Omit<Owner, "id">>({
    name: "",
    nationalCode: "99999999999",
    phoneNumber: "09999999999",
    fatherName: "",
    parcelCount: 0,
    totalArea: 0,
    status: "فعال",
    address: ""
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  const handleEdit = (owner: Owner) => {
    setEditedOwner({ ...owner });
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editedOwner) return;

    setOwners((prevOwners) =>
      prevOwners.map((owner) =>
        owner.id === editedOwner.id ? editedOwner : owner,
      ),
    );

    setIsEditModalOpen(false);
    setEditedOwner(null);
  };

  const handleAddOwner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOwnerData: Owner = {
      id: crypto.randomUUID(),
      ...newOwner,
    };

    setOwners((prevOwners) => [...prevOwners, newOwnerData]);

    setNewOwner({
      name: "",
      nationalCode: "99999999999",
      phoneNumber: "09999999999",
      fatherName: "",
      parcelCount: 0,
      totalArea: 0,
      status: "فعال",
      address: "",
    });

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

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-extralight">
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
                className="w-full py-2.5 px-3 text-sm text-foreground border-0  outline-none transition placeholder:text-foreground-muted "
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
            className="min-w-fit flex gap-2 items-center bg-blue-500 hover:bg-blue-600 transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
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
          onRowClick={(owners) => {
            router.push(`/owners/${encodeURIComponent(owners.id)}`);
          }}
        />
      </div>
      <Dialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="ویرایش مالک"
        description="اطلاعات مالک را ویرایش کنید"
        className="text-white"
      >
        {editedOwner && (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm">نام مالک</label>

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
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">تعداد قطعات</label>

              <input
                disabled
                type="text"
                min="0"
                value={toPersianNumber(editedOwner.parcelCount)}
                onChange={(e) =>
                  setEditedOwner({
                    ...editedOwner,
                    parcelCount: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">مساحت کل (هکتار)</label>

              <input
                disabled
                type="text"
                min="0"
                step="0.1"
                value={toPersianNumber(editedOwner.totalArea)}
                onChange={(e) =>
                  setEditedOwner({
                    ...editedOwner,
                    totalArea: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">وضعیت</label>

              <div className="relative">
                <select
                  value={editedOwner.status}
                  onChange={(e) =>
                    setEditedOwner({
                      ...editedOwner,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
                >
                  <option value="فعال">فعال</option>
                  <option value="غیر فعال">غیرفعال</option>
                </select>

                <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditedOwner(null);
                }}
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
      <Dialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="افزودن مالک"
        description="اطلاعات مالک جدید را وارد کنید"
        className="text-white"
      >
        <form onSubmit={handleAddOwner} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm">نام مالک</label>

            <input
              type="text"
              required
              value={newOwner.name}
              onChange={(e) =>
                setNewOwner({
                  ...newOwner,
                  name: e.target.value,
                })
              }
              placeholder="نام و نام خانوادگی"
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">تعداد قطعات</label>

            <input
              disabled
              type="text"
              min="0"
              required
              value={toPersianNumber(newOwner.parcelCount)}
              onChange={(e) =>
                setNewOwner({
                  ...newOwner,
                  parcelCount: Number(e.target.value),
                })
              }
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">مساحت کل (هکتار)</label>

            <input
              disabled
              type="text"
              min="0"
              step="0.1"
              required
              value={toPersianNumber(newOwner.totalArea)}
              onChange={(e) =>
                setNewOwner({
                  ...newOwner,
                  totalArea: Number(e.target.value),
                })
              }
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">وضعیت</label>

            <div className="relative">
              <select
                value={newOwner.status}
                onChange={(e) =>
                  setNewOwner({
                    ...newOwner,
                    status: e.target.value,
                  })
                }
                className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none appearance-none"
              >
                <option value="فعال">فعال</option>
                <option value="غیرفعال">غیرفعال</option>
              </select>

              <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewOwner({
                  name: "",
                  nationalCode: "99999999999",
                  phoneNumber: "09999999999",
                  fatherName: "",
                  parcelCount: 0,
                  totalArea: 0,
                  status: "فعال",
                  address: "",
                });
              }}
              className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
            >
              افزودن مالک
            </button>
          </div>
        </form>
      </Dialog>
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
              آیا مطمئن هستید که می‌خواهید مالک{" "}
              <span className="text-white font-semibold mx-1">
                {" "}
                {selectedOwner.name}{" "}
              </span>{" "}
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
