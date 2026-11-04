import { RegionStatus } from "@/app/components/dashboard/regions/RegionsTable";

export const regionMockData = [
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
