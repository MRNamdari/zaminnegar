"use client";

import { Dialog, DialogProps } from "../../Dialog";
import { IRegion } from "@/app/features/regions/interface";

interface Props extends Omit<DialogProps, "children"> {
  region: IRegion;
  onConfirm: () => void;
}

export function DeleteRegionDialog({
  region,
  onConfirm,
  onOpenChange,
  ...dialogProps
}: Props) {
  return (
    <Dialog
      {...dialogProps}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-5 mt-4">
        <p className="text-sm text-slate-300">
          آیا مطمئن هستید که می‌خواهید منطقه
          <span className="text-white font-semibold mx-1">
            {region.name}
          </span>
          را حذف کنید؟
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-lg bg-action-error hover:bg-action-error-hover transition duration-300 cursor-pointer"
          >
            حذف منطقه
          </button>
        </div>
      </div>
    </Dialog>
  );
}