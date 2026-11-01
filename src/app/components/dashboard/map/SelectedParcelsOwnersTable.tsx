"use client";

export enum BlockStatus {
  PROPOSED = "proposed",
  DRAFT = "draft",
  FINAL = "final",
}

export const BlockStatusMap: Record<BlockStatus, string> = {
  [BlockStatus.PROPOSED]: "پیشنهادیه",
  [BlockStatus.DRAFT]: "پیش‌نویس",
  [BlockStatus.FINAL]: "نهایی",
};

import { useMemo } from "react";
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  createSortedRowModel,
  createFilteredRowModel,
  filterFn_includesString,
  columnVisibilityFeature,
  sortFns,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  FiEdit2,
  FiArrowUp,
  FiArrowDown,
  FiEye,
} from "react-icons/fi";
import { toPersianNumber } from "@/app/util";
import { IOwner } from "@/app/features/owners/interface";
import { IBlock } from "@/app/features/blocks/interface";
import { IRegion } from "@/app/features/regions/interface";
import { IParcel } from "@/app/features/parcels/interface";

export interface ParcelsOwners {
  parcel: IParcel;
  owner: IOwner;
  block: IBlock;
  region: IRegion;
}

interface SelectedParcelsOwnersTableProps {
  data: ParcelsOwners[];
  onRowClick: (data: ParcelsOwners) => void;
  onEdit: (data: ParcelsOwners) => void;
  onDelete: (data: ParcelsOwners) => void;
  pageSize?: number;
}

// TanStack Table v9 features
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnVisibilityFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
});

const statusStyles: Record<BlockStatus, string> = {
  proposed: "bg-gray-100 text-gray-700",
  draft: "bg-yellow-200 text-yellow-700",
  final: "bg-green-200 text-green-700",
};

export default function SelectedParcelsOwnersTable({
  data,
  onRowClick,
  onEdit,
  onDelete,
}: SelectedParcelsOwnersTableProps) {
  const columns = useMemo<ColumnDef<typeof features, ParcelsOwners>[]>(
    () => [
      {
        accessorKey: "owner",
        header: "نام مالک",
        cell({ row }) {
          return row.original.owner.name;
        },
      },
      {
        accessorKey: "parcel",
        header: "کد قطعه",
        cell({ row }) {
          return row.original.parcel.name;
        },
      },
      {
        accessorKey: "block",

        header: "بلوک",
        cell({ row }) {
          return row.original.block.name;
        },
      },
      {
        accessorKey: "region",
        header: "مساحت",
        cell({ row }) {
          return (
            <div>
              <div>
                {toPersianNumber(
                  Math.round(parseFloat(row.original.parcel.areaM2) / 100) /
                    100,
                )}{" "}
                <span>هکتار</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Edit ${row.original.parcel.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row.original);
              }}
              className="isolate cursor-pointer rounded-full p-4 hover:text-blue-600 hover:bg-surface-raised-hover transition duration-300"
            >
              <FiEdit2 size={17} />
            </button>
            <button
              type="button"
              aria-label={`Edit ${row.original.parcel.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row.original);
              }}
              className="isolate cursor-pointer rounded-full p-4 hover:text-blue-600 hover:bg-surface-raised-hover transition duration-300"
            >
              <FiEye size={17} />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.parcel.id,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto rounded-lg border border-border col-span-8">
      <div className="max-h-36.5 overflow-y-auto scrollbar-gutter-stable">
        <div
          className="grid sticky top-0 z-10 bg-background text-left text-xs border-b border-b-slate-200/10"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(max-content, 1fr))`,
          }}
        >
          {table.getHeaderGroups().map((group) =>
            group.headers.map((header) => (
              <div key={header.id} className="px-4 py-2 font-light">
                {header.isPlaceholder ? null : (
                  <button
                    type="button"
                    disabled={!header.column.getCanSort()}
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex py-1.5 items-center gap-2 disabled:cursor-default text-xs"
                  >
                    <table.FlexRender header={header} />

                    {header.column.getCanSort() &&
                      (header.column.getIsSorted() === "asc" ? (
                        <FiArrowUp />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <FiArrowDown />
                      ) : null)}
                  </button>
                )}
              </div>
            )),
          )}
        </div>

        <div className="min-h-full">
          {rows.length === 0 ? (
            <div className="px-4 py-2 text-center text-gray-500">
              مالکیت یافت نشد
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick(row.original)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onRowClick(row.original);
                  }
                }}
                tabIndex={0}
                aria-label={`Open block ${row.original.parcel.name}`}
                className="grid cursor-pointer border-t border-border hover:bg-slate-800 odd:bg-slate-950 focus-visible:outline-2 focus-visible:outline-blue-500 transition duration-300"
                style={{
                  gridTemplateColumns: `repeat(${columns.length}, minmax(max-content, 1fr))`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="px-4 py-1.5 text-right text-xs flex flex-col justify-center">
                    <table.FlexRender cell={cell} />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
