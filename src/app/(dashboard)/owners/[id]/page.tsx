"use client";

import { notFound } from "next/navigation";
import { initialOwners } from "@/app/(dashboard)/mockData";
import { BackButton } from "@/app/components/dashboard/Backbutton";
import OwnersInformation from "@/app/components/dashboard/owners/OwnersInformation";
import ParcelsTable from "@/app/components/dashboard/parcels/ParcelsTable";
import { IParcel } from "@/app/features/parcels/interface";
import { use } from "react";

const parcelMockData: IParcel[] = [
  {
    id: "1",
    projectId: "project-1",
    blockId: "1",
    name: "قطعه شماره 1",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.58, 37.28],
            [49.581, 37.28],
            [49.581, 37.281],
            [49.58, 37.281],
            [49.58, 37.28],
          ],
        ],
      ],
    },
    fillColor: "#22c55e",
    fillOpacity: 0.3,
    strokeColor: "#16a34a",
    strokeWidth: 1,
    notes: "توضیحات قطعه",
    areaM2: "1200",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    block: {
      id: "3",
      regionId: "1",
      name: "بلوک شماره ۱",
      description: "توضیحات بلوک",
      territory: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [49.58, 37.28],
              [49.581, 37.28],
              [49.581, 37.281],
              [49.58, 37.281],
              [49.58, 37.28],
            ],
          ],
        ],
      },
      areaM2: "1200",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    owners: [
      {
        parcelId: "1",
        ownerId: "owner-1",
        share: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-1",
          name: "علی رضایی",
          phone: "09123456789",
          email: "ali@example.com",
          notes: "مالک اصلی قطعه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
  {
    id: "2",
    projectId: "project-1",
    blockId: "1",
    name: "قطعه شماره 2",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.58, 37.28],
            [49.581, 37.28],
            [49.581, 37.281],
            [49.58, 37.281],
            [49.58, 37.28],
          ],
        ],
      ],
    },
    fillColor: "#22c55e",
    fillOpacity: 0.3,
    strokeColor: "#16a34a",
    strokeWidth: 1,
    notes: "توضیحات قطعه",
    areaM2: "1200",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "inactive",
    block: {
      id: "3",
      regionId: "1",
      name: "بلوک شماره ۱",
      description: "توضیحات بلوک",
      territory: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [49.58, 37.28],
              [49.581, 37.28],
              [49.581, 37.281],
              [49.58, 37.281],
              [49.58, 37.28],
            ],
          ],
        ],
      },
      areaM2: "1200",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    owners: [
      {
        parcelId: "1",
        ownerId: "owner-1",
        share: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-1",
          name: "علی رضایی",
          phone: "09123456789",
          email: "ali@example.com",
          notes: "مالک اصلی قطعه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        parcelId: "1",
        ownerId: "owner-2",
        share: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-2",
          name: "محمد احمدی",
          phone: "09187654321",
          email: "mohammad@example.com",
          notes: "مالک مشترک",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
  {
    id: "3",
    projectId: "project-1",
    blockId: "1",
    name: "قطعه شماره 3",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.58, 37.28],
            [49.581, 37.28],
            [49.581, 37.281],
            [49.58, 37.281],
            [49.58, 37.28],
          ],
        ],
      ],
    },
    fillColor: "#22c55e",
    fillOpacity: 0.3,
    strokeColor: "#16a34a",
    strokeWidth: 1,
    notes: "توضیحات قطعه",
    areaM2: "1200",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    block: {
      id: "3",
      regionId: "1",
      name: "بلوک شماره ۱",
      description: "توضیحات بلوک",
      territory: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [49.58, 37.28],
              [49.581, 37.28],
              [49.581, 37.281],
              [49.58, 37.281],
              [49.58, 37.28],
            ],
          ],
        ],
      },
      areaM2: "1200",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    owners: [
      {
        parcelId: "1",
        ownerId: "owner-1",
        share: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-1",
          name: "علی رضایی",
          phone: "09123456789",
          email: "ali@example.com",
          notes: "مالک اصلی قطعه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        parcelId: "1",
        ownerId: "owner-2",
        share: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-2",
          name: "محمد احمدی",
          phone: "09187654321",
          email: "mohammad@example.com",
          notes: "مالک مشترک",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
  {
    id: "4",
    projectId: "project-1",
    blockId: "1",
    name: "قطعه شماره 1",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.58, 37.28],
            [49.581, 37.28],
            [49.581, 37.281],
            [49.58, 37.281],
            [49.58, 37.28],
          ],
        ],
      ],
    },
    fillColor: "#22c55e",
    fillOpacity: 0.3,
    strokeColor: "#16a34a",
    strokeWidth: 1,
    notes: "توضیحات قطعه",
    areaM2: "1200",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "inactive",
    block: {
      id: "3",
      regionId: "1",
      name: "بلوک شماره ۱",
      description: "توضیحات بلوک",
      territory: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [49.58, 37.28],
              [49.581, 37.28],
              [49.581, 37.281],
              [49.58, 37.281],
              [49.58, 37.28],
            ],
          ],
        ],
      },
      areaM2: "1200",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    owners: [
      {
        parcelId: "1",
        ownerId: "owner-1",
        share: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-1",
          name: "علی رضایی",
          phone: "09123456789",
          email: "ali@example.com",
          notes: "مالک اصلی قطعه",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        parcelId: "1",
        ownerId: "owner-2",
        share: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: "owner-2",
          name: "محمد احمدی",
          phone: "09187654321",
          email: "mohammad@example.com",
          notes: "مالک مشترک",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function OwnerDetailsPage({ params }: Props) {
  const { id } = use(params);



  const owner = initialOwners.find((item) => item.id === id);
console.log(owner);
  if (!owner) {
    notFound();
  }

  const filteredParcels = parcelMockData.filter((parcel) =>
    parcel.owners?.some(
      (parcelOwner) => parcelOwner.owner?.name === owner.name,
    ),
  );
  
  return (
    <div className="w-full h-full overflow-y-auto pb-4 pt-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center p-4 border border-slate-200/10 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="w-15 h-15 bg-slate-400 py-3.5 rounded-full flex items-center justify-center">
              <span className="font-black text-blue-950 -mt-1 text-xl">
                {owner.name?.trim().charAt(0) || "؟"}
              </span>
            </div>
            <h2 className="flex text-xl border-r border-slate-200/10 px-4 py-3.5 mr-5">
              جزئیات مالک {owner.name}
            </h2>
            <div
              className={`font-normal px-3 py-px rounded-sm ${owner.status === "فعال" ? "bg-map-green text-surface" : "bg-surface-muted text-foreground"}`}
            >
              {owner.status}
            </div>
          </div>
          <BackButton />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <OwnersInformation owner={owner} />
          <div className="flex flex-col gap-3">
            <h3>لیست قطعات</h3>
            <ParcelsTable
                      data={filteredParcels as any}
                      onDelete={console.log}
                      onEdit={console.log}
                      onRowClick={console.log}
                      searchValue={""}
                    />
          </div>
        </div>
      </div>
    </div>
  );
}
