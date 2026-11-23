import { registerDecorator, ValidationOptions } from 'class-validator';
import { isMultiPolygon } from '../../../common/validators/is-multi-polygon.validator';

/** Structural check for a WGS 84 GeoJSON Polygon (`[lon, lat]`, closed rings, at least one ring). */
export function isPolygon(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const { type, coordinates } = value as { type?: unknown; coordinates?: unknown };
  return (
    type === 'Polygon' &&
    Array.isArray(coordinates) &&
    // A Polygon is a MultiPolygon of one part: the ring and position rules are the same.
    isMultiPolygon({ type: 'MultiPolygon', coordinates: [coordinates] })
  );
}

export function IsPolygon(options?: ValidationOptions) {
  return (object: object, propertyName: string | symbol): void => {
    const name = String(propertyName);
    registerDecorator({
      name: 'isPolygon',
      target: object.constructor,
      propertyName: name,
      options,
      validator: {
        validate: isPolygon,
        defaultMessage: () => `${name} must be a GeoJSON Polygon in [longitude, latitude] with closed rings`,
      },
    });
  };
}
