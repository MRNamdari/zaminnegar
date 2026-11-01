"use client";
import { IBlock } from "@/app/features/blocks/interface";
import { IOwner } from "@/app/features/owners/interface";
import { IParcel } from "@/app/features/parcels/interface";
import { IRegion } from "@/app/features/regions/interface";
import { useEffect, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { HiOutlineCheck } from "react-icons/hi";

const regionMockData: IRegion[] = [
  {
    id: "region-001",
    name: "منطقه شالیزاری شمال",
    description: "منطقه کشاورزی شمال شامل چندین بلوک و قطعه شالیزاری",
    territory: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.5821, 37.2801],
            [49.5865, 37.2801],
            [49.5865, 37.2835],
            [49.5821, 37.2835],
            [49.5821, 37.2801],
          ],
        ],
        [
          [
            [49.588, 37.281],
            [49.59, 37.281],
            [49.59, 37.283],
            [49.588, 37.283],
            [49.588, 37.281],
          ],
        ],
      ],
    },
    areaM2: "1254000",
    createdAt: new Date("2026-01-15T08:30:00Z"),
    updatedAt: new Date("2026-03-20T14:45:00Z"),
    blocks: [],
  },
];

const blockMockData: IBlock[] = [
  {
    id: "block-001",
    regionId: "region-001",
    name: "بلوک شمالی",
    description: "بلوک کشاورزی شمالی",
    territory: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.5821, 37.282],
            [49.5843, 37.282],
            [49.5843, 37.2835],
            [49.5821, 37.2835],
            [49.5821, 37.282],
          ],
        ],
      ],
    },
    areaM2: "1854000",
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-02-10"),
    parcels: [],
  },
  {
    id: "block-002",
    regionId: "region-001",
    name: "بلوک جنوبی",
    description: "بلوک کشاورزی جنوبی",
    territory: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.5821, 37.2801],
            [49.5843, 37.2801],
            [49.5843, 37.282],
            [49.5821, 37.282],
            [49.5821, 37.2801],
          ],
        ],
      ],
    },
    areaM2: "1854000",
    createdAt: new Date("2026-01-17"),
    updatedAt: new Date("2026-02-15"),
    parcels: [],
  },
  {
    id: "block-003",
    regionId: "region-002",
    name: "بلوک مرکزی",
    description: "بلوک کشاورزی مرکزی",
    territory: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.59, 37.275],
            [49.5925, 37.275],
            [49.5925, 37.277],
            [49.59, 37.277],
            [49.59, 37.275],
          ],
        ],
      ],
    },
    areaM2: "1854000",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-04-12"),
    parcels: [],
  },
];
const parcelMockData: IParcel[] = [
  {
    id: "parcel-001",
    projectId: "project-001",
    blockId: "block-001",
    name: "قطعه شماره ۱",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.5821, 37.282],
            [49.583, 37.282],
            [49.583, 37.2828],
            [49.5821, 37.2828],
            [49.5821, 37.282],
          ],
        ],
      ],
    },
    fillColor: "#22c55e",
    fillOpacity: 0.4,
    strokeColor: "#15803d",
    strokeWidth: 2,
    notes: "زمین شالیزاری با کشت برنج",
    areaM2: "8500",
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-02-15"),
    owners: [],
  },
  {
    id: "parcel-002",
    projectId: "project-001",
    blockId: "block-001",
    name: "قطعه شماره ۲",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.583, 37.282],
            [49.584, 37.282],
            [49.584, 37.2828],
            [49.583, 37.2828],
            [49.583, 37.282],
          ],
        ],
      ],
    },
    fillColor: "#3b82f6",
    fillOpacity: 0.4,
    strokeColor: "#1d4ed8",
    strokeWidth: 2,
    notes: "زمین کشاورزی در بخش شمالی بلوک",
    areaM2: "9200",
    createdAt: new Date("2026-01-22"),
    updatedAt: new Date("2026-02-18"),
    owners: [],
  },
  {
    id: "parcel-003",
    projectId: "project-001",
    blockId: "block-002",
    name: "قطعه شماره ۳",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.5821, 37.2801],
            [49.5831, 37.2801],
            [49.5831, 37.281],
            [49.5821, 37.281],
            [49.5821, 37.2801],
          ],
        ],
      ],
    },
    fillColor: "#f59e0b",
    fillOpacity: 0.4,
    strokeColor: "#b45309",
    strokeWidth: 2,
    notes: "قطعه دارای سیستم آبیاری مستقل",
    areaM2: "7800",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-03-10"),
    owners: [],
  },
  {
    id: "parcel-004",
    projectId: "project-001",
    blockId: null,
    name: "قطعه مستقل شماره ۴",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [49.59, 37.275],
            [49.591, 37.275],
            [49.591, 37.276],
            [49.59, 37.276],
            [49.59, 37.275],
          ],
        ],
      ],
    },
    fillColor: "#a855f7",
    fillOpacity: 0.4,
    strokeColor: "#7e22ce",
    strokeWidth: 2,
    notes: null,
    areaM2: "9800",
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-03-15"),
    owners: [],
  },
];
const ownerMockData: IOwner[] = [
  {
    id: "owner-001",
    name: "علی رضایی",
    phone: "09123456789",
    email: "ali.rezaei@example.com",
    notes: "مالک زمین‌های کشاورزی شمال منطقه",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-15"),
    parcels: [],
  },
  {
    id: "owner-002",
    name: "محمد احمدی",
    phone: "09123456780",
    email: "mohammad.ahmadi@example.com",
    notes: "مالک چند قطعه شالیزاری",
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-02-20"),
    parcels: [],
  },
  {
    id: "owner-003",
    name: "حسین کریمی",
    phone: "09123456781",
    email: null,
    notes: "مالک زمین‌های بخش جنوبی",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-03-01"),
    parcels: [],
  },
  {
    id: "owner-004",
    name: "رضا محمدی",
    phone: null,
    email: "reza.mohammadi@example.com",
    notes: null,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
    parcels: [],
  },
];

export default function LayerManagement() {
  const [isOpen, setIsOpen] = useState({
    region: true,
    blocks: true,
    parcels: true,
    owners: true,
  });
  return (
    <aside className="py-3 pl-2 pr-3">
      <h3 className="border-b border-border text-xs pb-2 block">
        مدیریت لایه ها
      </h3>
      <div>
        <Layer<IRegion>
          colors={{ icon: "--map-green", input: "--map-green-hover" }}
          data={regionMockData}
          label="مناطق"
          onChange={(region, chk) => {}}
          defaultOpen={isOpen.region}
        />
        <Layer<IBlock>
          colors={{ icon: "--map-blue", input: "--map-blue-hover" }}
          data={blockMockData}
          label="بلوک‌ها"
          onChange={(block, chk) => {}}
          defaultOpen={isOpen.blocks}
        />
        <Layer<IParcel>
          colors={{ icon: "--map-yellow", input: "--map-yellow-hover" }}
          data={parcelMockData}
          label="قطعه‌ها"
          onChange={(parcel, chk) => {}}
          defaultOpen={isOpen.parcels}
        />
        <Layer<IOwner>
          colors={{ icon: "--map-purple", input: "--map-purple-hover" }}
          data={ownerMockData}
          label="مالکین"
          onChange={(owner, chk) => {}}
          defaultOpen={isOpen.owners}
        />
      </div>
    </aside>
  );
}

interface LayerProps<T> {
  defaultOpen?: boolean;
  onChange(layerData: T, checked: boolean): void;
  colors: { icon: string; input: string };
  label: string;
  data: T[];
}

function Layer<T extends { name: string }>(props: LayerProps<T>) {
  const [isClose, setClose] = useState<boolean>(
    props.defaultOpen !== undefined ? !props.defaultOpen : false,
  );

  return (
    <div
      className={`feature_items_wrap relative h-fit ${isClose ? "overflow-visible" : "overflow-hidden"} border-b border-border cursor-pointer`}
    >
      <div
        className="title_feature flex items-center justify-end py-3 gap-2 relative"
        onClick={() => setClose((prev) => !prev)}
      >
        <GoChevronDown
          className={`absolute right-1.5 transition-transform duration-300 ${
            isClose ? "rotate-180" : ""
          }`}
        />
        <h4 className="text-xs font-medium">{props.label}</h4>
        <PolygonIcon fillColor={`var(${props.colors.icon})`} />
      </div>
      <div
        className={`${isClose ? "absolute opacity-0 invisible" : "opacity-100 visible"} w-full flex flex-col gap-3 mb-3 pr-1`}
      >
        {props.data.map((item, key) => (
          <label
            key={key}
            className="flex items-center justify-end cursor-pointer gap-3 text-xs select-none"
          >
            <span>{item.name}</span>
            <div className="relative">
              <input
                type="checkbox"
                onChange={(e) => props.onChange(item, e.target.checked)}
                style={
                  {
                    "--input": `var(${props.colors.input})`,
                  } as React.CSSProperties
                }
                className={`peer appearance-none w-4 h-4 border border-border checked:border-0 rounded-sm cursor-pointer transition-colors duration-200  checked:bg-(--input)`}
              />
              <HiOutlineCheck className="peer-checked:block hidden absolute inset-x-0.5 inset-y-0.5 text-background" />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export const PolygonIcon = ({
  fillColor = "",
  className = "",
  width = "20px",
}: {
  fillColor?: string;
  className?: string;
  width?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    preserveAspectRatio="xMidYMid meet"
    fill={fillColor}
    width={width}
    className={className}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M32.5 10.95c-6.89 0-12.55 5.66-12.55 12.55c0 4.02 1.935 7.613 4.91 9.916L14.815 54.172a12.354 12.354 0 0 0-2.316-.223C5.61 53.95-.05 59.61-.05 66.5c0 6.89 5.66 12.55 12.55 12.55c5.13 0 9.54-3.151 11.463-7.603l51.277 7.71c1.232 5.629 6.281 9.894 12.26 9.894c6.656 0 12.114-5.297 12.48-11.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-.134 0-.264.015-.396.019L80.242 43.05c3.275-2.127 5.509-5.746 5.738-9.867a3.5 3.5 0 0 0 .07-.684a3.5 3.5 0 0 0-.071-.7c-.375-6.562-5.829-11.85-12.479-11.85c-5.062 0-9.452 3.06-11.43 7.415l-17.082-4.517a3.5 3.5 0 0 0-.01-.047c-.374-6.563-5.828-11.852-12.478-11.852zm0 7c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm41 9c3.107 0 5.55 2.443 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm-30.137 2.708l17.739 4.69C62.007 40.37 67.239 45.05 73.5 45.05l.033-.002l6.92 21.092a12.688 12.688 0 0 0-4.705 6.015l-50.916-7.654a12.611 12.611 0 0 0-3.787-7.13l10.342-21.378c.368.033.737.057 1.113.057c4.652 0 8.71-2.592 10.863-6.393zM12.5 60.95c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55zm75 10c3.107 0 5.55 2.444 5.55 5.551s-2.443 5.55-5.55 5.55c-3.107 0-5.55-2.443-5.55-5.55c0-3.107 2.443-5.55 5.55-5.55z"
        fill={fillColor}
      />
    </g>
  </svg>
);
