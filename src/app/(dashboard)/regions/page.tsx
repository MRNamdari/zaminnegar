"use client";

import { AddRegionDialog } from "@/app/components/dashboard/regions/AddRegionDialog";
import RegionsTable, {
  RegionStatus,
} from "@/app/components/dashboard/regions/RegionsTable";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { CgSearch } from "react-icons/cg";
const regionMockData = [
  {
    id: "sdfsdf",
    createdAt: "",
    updatedAt: "",
    description: "i dont have any",
    name: "TOROQ",
    status: RegionStatus.INACTIVE,
    territory: {
      type: "MultiPolygon",
      coordinates: [
        // Polygon 2 (separate island/field)
        [
          [
            [13.415, 52.52],
            [13.425, 52.52],
            [13.425, 52.53],
            [13.415, 52.53],
            [13.415, 52.52],
          ],
        ],
      ],
    },
    areaM2: "10222450.45",
  },
  {
    id: "ssdfmnty",
    createdAt: "",
    updatedAt: "",
    description: "i dont have any",
    name: "TOROQ2",
    status: RegionStatus.ACTIVE,
    territory: {
      type: "MultiPolygon",
      coordinates: [
        // Polygon 1 (with a hole)
        [
          // Outer ring
          [
            [13.4, 52.52],
            [13.41, 52.52],
            [13.41, 52.53],
            [13.4, 52.53],
            [13.4, 52.52],
          ],
          // Inner ring (hole)
          [
            [13.403, 52.523],
            [13.407, 52.523],
            [13.407, 52.527],
            [13.403, 52.527],
            [13.403, 52.523],
          ],
        ],
      ],
    },
    areaM2: "10222450.45",
  },
  {
    id: "ssdfmgggnty",
    createdAt: "",
    updatedAt: "",
    description: "i dont have any",
    name: "TOROQ2",
    status: RegionStatus.ACTIVE,
    territory: {
      type: "MultiPolygon",
      coordinates: [
        // Polygon 1 (with a hole)
        [
          // Outer ring
          [
            [13.4, 52.52],
            [13.41, 52.52],
            [13.41, 52.53],
            [13.4, 52.53],
            [13.4, 52.52],
          ],
          // Inner ring (hole)
          [
            [13.403, 52.523],
            [13.407, 52.523],
            [13.407, 52.527],
            [13.403, 52.527],
            [13.403, 52.523],
          ],
        ],
      ],
    },
    areaM2: "10222450.45",
  },
  {
    id: "ssdfmnasdty",
    createdAt: "",
    updatedAt: "",
    description: "i dont have any",
    name: "TOROQ2",
    status: RegionStatus.ACTIVE,
    territory: {
      type: "MultiPolygon",
      coordinates: [
        // Polygon 1 (with a hole)
        [
          // Outer ring
          [
            [13.4, 52.52],
            [13.41, 52.52],
            [13.41, 52.53],
            [13.4, 52.53],
            [13.4, 52.52],
          ],
          // Inner ring (hole)
          [
            [13.403, 52.523],
            [13.407, 52.523],
            [13.407, 52.527],
            [13.403, 52.527],
            [13.403, 52.523],
          ],
        ],
      ],
    },
    areaM2: "10222450.45",
  },
];

export default function RegionsPage() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [searchValue, setSearchValue] = useState("");
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const filteredRegions = regionMockData.filter((region) =>
    region.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center pb-4 pt-6 pr-4">
        <h2 className="w-full text-right text-3xl leading-loose font-normal">
          منطقه ها
        </h2>
        <div className="block-header w-full flex gap-4 justify-between items-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-[#504e4e52]"
          >
            <label htmlFor="simple-search" className="sr-only">
              جست و جو منطقه
            </label>

            <search className="min-w-0 w-full rounded-lg flex flex-1 border border-border bg-surface focus-within:ring-2 focus-within:ring-action-primary-hover/20">
              <input
                type="search"
                id="simple-search"
                placeholder="جست و جوی منطقه..."
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
            onClick={() => setIsAddingRegion(true)}
            className="min-w-fit flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
          >
            <AiOutlinePlus className="text-white" />
            <span className="text-sm text-white">افزودن منطقه</span>
          </button>
        </div>
        <RegionsTable
          data={filteredRegions as any}
          onDelete={console.log}
          onEdit={console.log}
          onRowClick={console.log}
          searchValue={searchValue}
        />
        <AddRegionDialog
          open={isAddingRegion}
          onOpenChange={(open) => setIsAddingRegion(open)}
          title="افزودن منطقه"
          description="اطلاعات منطقه جدید را وارد کنید"
          className="text-white"
        />
      </div>
    </div>
  );
}
