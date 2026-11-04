"use client";

import DetailsLayer from "@/app/components/dashboard/map/DetailsLayer";
import LayerManagement from "@/app/components/dashboard/map/LayerManagement";
import MapEditor from "@/app/features/map-editor/MapEditor";
import SelectedParcels from "@/app/components/dashboard/map/SelectedParcels";
import SelectedParcelsOwnersTable from "@/app/components/dashboard/map/SelectedParcelsOwnersTable";
import { AreaCollection, MapEditorProvider } from "@/app/features/map-editor";
// export const instant = false;
export default function MapPage() {
  return (
    <MapEditorProvider
      onChange={(geojson) => {
        console.log("Map updated:", geojson);
      }}
    >
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-3 h-full overflow-y-auto scrollbar-gutter-stable border-e border-border">
          <DetailsLayer />
        </div>
        <div className="col-span-7 h-full border-e border-border grid grid-rows-[1fr_auto]">
          <div className="row-span-9 min-h-0">
            <div className="h-175">
              <MapEditor initialData={features} />
            </div>
          </div>
          <div className="row-span-3 grid grid-cols-12 gap-2 p-2">
            <SelectedParcelsOwnersTable
              data={
                [
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                  {
                    parcel: { areaM2: "8000", name: "P450" },
                    block: { name: "B516" },
                    owner: { name: "نوید نورزاد" },
                    region: { name: "R65" },
                  },
                ] as any
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
    </MapEditorProvider>
  );
}

const features: AreaCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "75c56005-4102-476d-8739-1802ea5f20ed",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [59.65372324, 36.198694018],
            [59.652886391, 36.195784913],
            [59.654903412, 36.194053251],
            [59.657242298, 36.193308625],
            [59.657864571, 36.191213244],
            [59.659731388, 36.189273667],
            [59.663894176, 36.188615586],
            [59.663937092, 36.18705695],
            [59.663293362, 36.185203864],
            [59.667799473, 36.181462922],
            [59.673700333, 36.177358072],
            [59.680073261, 36.17669989],
            [59.681403637, 36.177877685],
            [59.683656693, 36.179124743],
            [59.685738087, 36.180111983],
            [59.68865633, 36.180787455],
            [59.69114542, 36.180770136],
            [59.685759544, 36.176474722],
            [59.688956738, 36.174222999],
            [59.694213867, 36.17328765],
            [59.696316719, 36.177115585],
            [59.698569775, 36.173997824],
            [59.703118801, 36.175955099],
            [59.70856905, 36.167623348],
            [59.710478783, 36.168628056],
            [59.71391201, 36.168593411],
            [59.715778828, 36.169944549],
            [59.718568325, 36.170914582],
            [59.724597931, 36.16064201],
            [59.770410061, 36.199403961],
            [59.755625725, 36.203057472],
            [59.753351212, 36.203490341],
            [59.734575748, 36.208753839],
            [59.711573124, 36.215021094],
            [59.711465836, 36.216129065],
            [59.702796936, 36.217756369],
            [59.700629711, 36.218950857],
            [59.693098068, 36.21219916],
            [59.688463211, 36.208667271],
            [59.685480595, 36.206693499],
            [59.684085846, 36.204892821],
            [59.68183279, 36.203767376],
            [59.680588245, 36.202936269],
            [59.678764343, 36.202641916],
            [59.674944878, 36.200165845],
            [59.665117264, 36.200096583],
            [59.65372324, 36.198694018],
          ],
        ],
      },
      properties: {
        id: "75c56005-4102-476d-8739-1802ea5f20ed",
        level: "region",
        name: "منطقه ۲",
        status: { mode: "view", selected: true },
        areaHa: 3376.972,
      },
    },
  ],
};
