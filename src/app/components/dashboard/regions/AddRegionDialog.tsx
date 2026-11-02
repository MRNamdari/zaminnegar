"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogProps } from "../../Dialog";

export function AddRegionDialog(
  props: Omit<DialogProps, "children">
) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleGoToMap = () => {
    if (!name.trim()) return;

    router.push("/map");
  };

  return (
    <Dialog {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGoToMap();
        }}
        className="flex flex-col gap-4 mt-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm">نام منطقه</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام منطقه را وارد کنید"
            className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">توضیحات</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات منطقه را وارد کنید"
            rows={3}
            className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => props.onOpenChange?.(false)}
            className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="submit"
            className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            برو به نقشه
          </button>
        </div>
      </form>
    </Dialog>
  );
}