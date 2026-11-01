import type { Level } from "../types";

const rad = (degrees: number) => (degrees * Math.PI) / 180;

export function ringAreaM2(ring: number[][]): number {
  const radius = 6378137;
  let sum = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];

    sum += rad(x2 - x1) * (2 + Math.sin(rad(y1)) + Math.sin(rad(y2)));
  }

  return Math.abs((sum * radius * radius) / 2);
}

export function centroid(ring: number[][]): [number, number] {
  const points = ring.slice(0, -1);
  const count = points.length || 1;

  return [
    points.reduce((sum, point) => sum + point[0], 0) / count,
    points.reduce((sum, point) => sum + point[1], 0) / count,
  ];
}

export function pointInRing(
  [x, y]: [number, number],
  ring: number[][],
): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

export function findParent(
  level: Level,
  ring: number[][],
  items: {
    id: string;
    level: Level;
    ring: number[][];
  }[],
): string | null {
  const center = centroid(ring);

  const parentLevels: Level[] =
    level === "parcel"
      ? ["block", "region"]
      : level === "block"
        ? ["region"]
        : [];

  for (const parentLevel of parentLevels) {
    const parent = items.find(
      (item) => item.level === parentLevel && pointInRing(center, item.ring),
    );

    if (parent) return parent.id;
  }

  return null;
}

export function formatFaNumber(value: number) {
  return value.toLocaleString("fa-IR");
}
