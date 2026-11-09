
import { Projects } from "@/app/features/projects/interface";

export const projectMockData: Projects[] = [
  {
    id: "project-1",
    name: "پروژه کشت و صنعت شمال",
    description: "مدیریت و ثبت اراضی شالیزاری منطقه شمال",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [49.58, 37.28],
          [49.585, 37.28],
          [49.585, 37.285],
          [49.58, 37.285],
          [49.58, 37.28],
        ]],
      ],
    },
    boundaries: "12",
    regions: "4",
    blocks: "12",
    parcels: "48",
    owners: "25",
    status: "فعال",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date(),
  },

  {
    id: "project-2",
    name: "پروژه اراضی کشاورزی گیلان",
    description: "ساماندهی و بررسی مالکیت زمین‌های کشاورزی",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [49.59, 37.29],
          [49.596, 37.29],
          [49.596, 37.295],
          [49.59, 37.295],
          [49.59, 37.29],
        ]],
      ],
    },
    boundaries: "8",
    regions: "3",
    blocks: "9",
    parcels: "32",
    owners: "18",
    status: "فعال",
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date(),
  },

  {
    id: "project-3",
    name: "پروژه توسعه شالیزارهای مازندران",
    description: "ثبت محدوده‌ها و تفکیک اراضی شالیزاری",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [50.01, 36.85],
          [50.016, 36.85],
          [50.016, 36.856],
          [50.01, 36.856],
          [50.01, 36.85],
        ]],
      ],
    },
    boundaries: "5",
    regions: "2",
    blocks: "6",
    parcels: "21",
    owners: "14",
    status: "در انتظار",
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date(),
  },

  {
    id: "project-4",
    name: "پروژه ساماندهی اراضی کشاورزی",
    description: "بررسی و مستندسازی زمین‌های کشاورزی",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [50.02, 36.86],
          [50.025, 36.86],
          [50.025, 36.865],
          [50.02, 36.865],
          [50.02, 36.86],
        ]],
      ],
    },
    boundaries: "3",
    regions: "1",
    blocks: "4",
    parcels: "15",
    owners: "9",
    status: "غیر فعال",
    createdAt: new Date("2026-08-05"),
    updatedAt: new Date(),
  },
];
