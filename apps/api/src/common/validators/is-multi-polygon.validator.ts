import { registerDecorator, ValidationOptions } from 'class-validator';

const isPosition = (p: unknown): boolean =>
  Array.isArray(p) &&
  p.length === 2 &&
  p.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
  Math.abs(p[0] as number) <= 180 &&
  Math.abs(p[1] as number) <= 90;

const isClosedRing = (r: unknown): boolean => {
  if (!Array.isArray(r) || r.length < 4 || !r.every(isPosition)) return false;
  const first = r[0] as number[];
  const last = r[r.length - 1] as number[];
  return first[0] === last[0] && first[1] === last[1];
};

/** Structural check for a WGS 84 GeoJSON MultiPolygon (`[lon, lat]`, closed rings). */
export function isMultiPolygon(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const { type, coordinates } = value as { type?: unknown; coordinates?: unknown };
  return (
    type === 'MultiPolygon' &&
    Array.isArray(coordinates) &&
    coordinates.length > 0 &&
    coordinates.every(
      (polygon) => Array.isArray(polygon) && polygon.length > 0 && polygon.every(isClosedRing),
    )
  );
}

export function IsMultiPolygon(options?: ValidationOptions) {
  return (object: object, propertyName: string | symbol): void => {
    const name = String(propertyName);
    registerDecorator({
      name: 'isMultiPolygon',
      target: object.constructor,
      propertyName: name,
      options,
      validator: {
        validate: isMultiPolygon,
        defaultMessage: () =>
          `${name} must be a GeoJSON MultiPolygon in [longitude, latitude] with closed rings`,
      },
    });
  };
}
