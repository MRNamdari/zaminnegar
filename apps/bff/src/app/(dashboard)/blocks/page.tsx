"use client";
import { AiOutlinePlus } from "react-icons/ai";
import BlocksTable from "@/app/components/dashboard/blocks/BlocksTable";
import { useState } from "react";
import { Dialog } from "@/app/components/Dialog";
import { type Block } from "@/app/components/dashboard/blocks/BlocksTable";
import { useRouter } from "next/navigation";
import { mockBlocks } from "@/app/(dashboard)/mockData";
import { CgSearch } from "react-icons/cg";
import CreateBlockForm from "@/app/components/dashboard/blocks/BlockFormCreate";
import { BlockFormValue } from "@/app/components/dashboard/blocks/schemas/BlockCreate.schema";
import UpdateBlockForm from "@/app/components/dashboard/blocks/BlockFormUpdate";

export default function BlockPage() {
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  const handleAddBlock = (values: BlockFormValue) => {
    const newBlockData: any = {
      id: String(blocks.length + 1),
      ...values,
    }
    setBlocks((prevOwners) => [...prevOwners, newBlockData]);
    setIsAddModalOpen(false);
  };

  const handleEditBlock = (block: Block) => {
    setSelectedBlock(block);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateBlock = (values: BlockFormValue) => {
    if (!selectedBlock) return;

    const updatedBlock: Block = {
      ...selectedBlock,
      code: values.blockCode,
      region: values.blockAreaName,
      status: values.blockStatus,
    };

    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === selectedBlock.id ? updatedBlock : block,
      ),
    );

    setIsUpdateModalOpen(false);
    setSelectedBlock(null);
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
              جست و جو بلوک
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی بلوک..."
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
            onClick={() => {
              setSelectedBlock(null);
              setIsAddModalOpen(true);
            }}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن بلوک</span>
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
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="افزودن بلوک"
        description="اطلاعات بلوک جدید را وارد کنید"
        className="text-white"
      >
        <CreateBlockForm
          onSubmit={handleAddBlock}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Dialog>
      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
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
