"use client";
import { AiOutlinePlus } from "react-icons/ai";
import BlocksTable from "@/app/components/dashboard/blocks/BlocksTable";
import { useState } from "react";
import { Dialog } from "@/app/components/Dialog";
import { IoChevronDown } from "react-icons/io5";
import {
  BlockStatus,
  BlockStatusMap,
  type Block,
} from "@/app/components/dashboard/blocks/BlocksTable";
import { useRouter } from "next/navigation";
import { mockBlocks } from "@/app/(dashboard)/mockData";

export default function BlockPage() {
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [nameBlock, setNameBlock] = useState("");
  const [nameRegion, setNameRegion] = useState("");
  const [valueStatus, setValueStatus] = useState<BlockStatus | "">("");
  const [alt, setAlt] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleAddBlock = () => {
    if (!nameBlock.trim() || !nameRegion || !valueStatus) {
      setAlt("لطفاً تمام فیلدها را تکمیل کنید");
      return;
    }

    if (blocks.some((block) => block.code === nameBlock.trim())) {
      setAlt("کد این بلوک قبلاً ثبت شده است");
      return;
    }

    const newBlock: Block = {
      code: nameBlock.trim(),
      region: nameRegion,
      parcelCount: 0,
      status: valueStatus,
    };

    setBlocks((prevBlocks) => [newBlock, ...prevBlocks]);
    console.log("New Block:", blocks);
    setNameBlock("");
    setNameRegion("");
    setValueStatus("");

    setIsOpen(false);
  };

  const handleEditBlock = (block: Block) => {
    setSelectedBlock(block);

    setNameBlock(block.code);
    setNameRegion(block.region);
    setValueStatus(block.status);

    setIsOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedBlock) return;

    if (!nameBlock.trim() || !nameRegion || !valueStatus) {
      setAlt("لطفاً تمام فیلدها را تکمیل کنید");
      return;
    }

    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.code === selectedBlock.code
          ? {
              ...block,
              code: nameBlock.trim(),
              region: nameRegion,
              status: valueStatus,
            }
          : block,
      ),
    );

    setSelectedBlock(null);
    setIsOpen(false);
  };

  const handleDelete = (block: Block) => {
    setSelectedBlock(block);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (!selectedBlock) return;

    setBlocks((prevBlocks) =>
      prevBlocks.filter((item) => item.code !== selectedBlock.code),
    );

    setIsDeleteModalOpen(false);
    setSelectedBlock(null);
  };
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-extralight">
          بلوک ها
        </h2>
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جستجو
            </label>

            <search className="min-w-0 w-full flex-1">
              <input
                type="search"
                id="simple-search"
                placeholder="جستجوی بلوک..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="block w-full py-2.5 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-300"
              />
            </search>

            <button
              type="submit"
              aria-label="جستجو"
              className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>
          </form>
          <button
            onClick={() => {
              setSelectedBlock(null);
              setNameBlock("");
              setNameRegion("");
              setValueStatus("");
              setIsOpen(true);
            }}
            className="min-w-fit flex gap-2 items-center bg-blue-500 hover:bg-blue-600 transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus />
            <span className="text-sm">افزودن بلوک</span>
          </button>
        </div>
        <BlocksTable
          data={blocks}
          onDelete={handleDelete}
          onEdit={handleEditBlock}
          searchValue={searchValue}
          onRowClick={(block) => {
            router.push(`/blocks/${encodeURIComponent(block.code)}`);
          }}
        />
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={selectedBlock ? "ویرایش بلوک" : "افزودن بلوک جدید"}
        description={
          selectedBlock
            ? "اطلاعات بلوک انتخاب‌شده را ویرایش کنید."
            : "اطلاعات بلوک جدید را وارد کنید."
        }
        className="text-white"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm">کد بلوک</label>
            <input
              value={nameBlock}
              onChange={(e) => setNameBlock(e.target.value)}
              type="text"
              placeholder="کد بلوک"
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border-border outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={nameRegion}
              onChange={(e) => setNameRegion(e.target.value)}
              name="status"
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
          <div className="relative">
            <select
              value={valueStatus}
              onChange={(e) => setValueStatus(e.target.value as BlockStatus)}
              name="status"
              className="w-full p-2.5 rounded-lg bg-slate-700 text-white border-border outline-none appearance-none"
            >
              <option value="" disabled>
                وضعیت
              </option>

              {Object.values(BlockStatus).map((status) => (
                <option key={status} value={status}>
                  {BlockStatusMap[status]}
                </option>
              ))}
            </select>

            <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-lg pointer-events-none" />
          </div>
        </form>
        <p className="text-sm text-red-400 pt-4 pr-1">{alt}</p>
        <button
          type="button"
          onClick={selectedBlock ? handleSaveEdit : handleAddBlock}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg cursor-pointer"
        >
          {selectedBlock ? "ذخیره تغییرات" : "ثبت بلوک"}
        </button>
      </Dialog>
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);

          if (!open) {
            setSelectedBlock(null);
          }
        }}
        title="حذف بلوک"
        description="آیا از حذف این بلوک اطمینان دارید؟"
        className="text-white"
      >
        {selectedBlock && (
          <div className="flex flex-col gap-5 mt-4">
            <p className="text-sm text-slate-300">
              آیا مطمئن هستید که می‌خواهید بلوک
              <span className="text-white font-semibold mx-1">
                {selectedBlock.code}
              </span>
              را حذف کنید؟
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedBlock(null);
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
                حذف بلوک
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
