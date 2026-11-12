'use client';

<<<<<<< HEAD
import DetailsLevel from '@/app/_components/dashboard/map/DetailsLevel';
import LevelManagement from '@/app/_components/dashboard/map/LevelManagement';
import { MapWorkspace } from '@/app/_components/dashboard/map/MapWorkspace';
import { ParcelCreateForm } from '@/app/_components/dashboard/map/ParcelCreateForm';
import SelectedParcels from '@/app/_components/dashboard/map/SelectedParcels';
import SelectedParcelsOwnersTable from '@/app/_components/dashboard/map/SelectedParcelsOwnersTable';
import { DraftConfigurationFlow, MapEditor } from '@/app/features/map-editor';
import { CreateBlockDto } from '@zaminnegar/api-client';
const result = CreateBlockDto.safeParse({});
console.log(result.error);
=======
import DetailsLevel from '@/app/components/dashboard/map/DetailsLevel';
import LevelManagement from '@/app/components/dashboard/map/LevelManagement';
import { MapWorkspace } from '@/app/components/dashboard/map/MapWorkspace';
import { ParcelCreateForm } from '@/app/components/dashboard/map/ParcelCreateForm';
import SelectedParcels from '@/app/components/dashboard/map/SelectedParcels';
import SelectedParcelsOwnersTable from '@/app/components/dashboard/map/SelectedParcelsOwnersTable';
import { DraftConfigurationFlow, MapEditor } from '@/app/features/map-editor';

export default function MapPage() {
  return (
    <MapWorkspace>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-3 h-full overflow-y-auto scrollbar-gutter-stable border-e border-border">
          <DetailsLevel />
        </div>
        <div className="col-span-7 h-full border-e border-border grid grid-rows-[1fr_auto]">
          <div className="row-span-9 min-h-0">
            <div className="h-full">
              <MapEditor />
              <DraftConfigurationFlow
                steps={[
                  {
                    id: 'parcel-information',
                    label: 'مشخصات قطعه',
                    description: ' اطلاعات اولیه قطعه جدید را وارد کنید.',
                    component: ParcelCreateForm,
                  },
                ]}
              />
            </div>
          </div>
          <div className="row-span-3 grid grid-cols-12 gap-2 p-2">
            <SelectedParcelsOwnersTable
              data={
                [
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
                  },
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
                  },
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
                  },
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
                  },
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
                  },
                  {
                    parcel: { areaM2: '8000', name: 'P450' },
                    block: { name: 'B516' },
                    owner: { name: 'نوید نورزاد' },
                    region: { name: 'R65' },
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
          <LevelManagement />
        </div>
      </div>
    </MapWorkspace>
  );
}
