"use client";

import DetailsLayer from "@/app/components/dashboard/map/DetailsLayer";
import LayerManagement from "@/app/components/dashboard/map/LayerManagement";
import MapEditor from "@/app/components/dashboard/map/MapEditor";
import SelectedParcels from "@/app/components/dashboard/map/SelectedParcels";
import SelectedParcelsOwnersTable from "@/app/components/dashboard/map/SelectedParcelsOwnersTable";
// export const instant = false;
export default function MapPage() {
  return (
    <div className="grid grid-cols-12 h-full">
      <div className="col-span-3 h-full overflow-y-auto scrollbar-gutter-stable border-e border-border">
        <DetailsLayer />
      </div>
      <div className="col-span-7 h-full border-e border-border grid grid-rows-12">
        <div className="row-span-9 min-h-0">
          <MapEditor />
        </div>
        <div className="row-span-3 grid grid-cols-12 gap-2 p-2">
          <SelectedParcelsOwnersTable
            data={
              [
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
                // {
                //   parcel: { areaM2: "8000", name: "P450" },
                //   block: { name: "B516" },
                //   owner: { name: "نوید نورزاد" },
                //   region: {name: "R65"}
                // },
              ]
            }
            onDelete={console.log}
            onEdit={console.log}
            onRowClick={console.log}
          />
          <div className="col-span-4 border border-border rounded-lg">
            <SelectedParcels />
          </div>
        </div>
      </div>
      <div className="col-span-2 h-full overflow-y-auto scrollbar-gutter-stable">
        <LayerManagement />
      </div>
    </div>
  );
}
