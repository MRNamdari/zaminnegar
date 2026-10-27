import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { validateMultiPolygonCoordinates } from '../utils/validate-multi-polygon-coordinates';

/** class-validator decorator that checks GeoJSON MultiPolygon coordinates. */
export function IsMultiPolygonCoordinates(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) =>
    registerDecorator({
      name: 'isMultiPolygonCoordinates',
      target: target.constructor,
      propertyName: propertyKey as string,
      options,
      validator: {
        validate: (value: unknown) => validateMultiPolygonCoordinates(value) === null,
        defaultMessage: (args?: ValidationArguments) =>
          `${args?.property} is not valid MultiPolygon coordinates: ${validateMultiPolygonCoordinates(args?.value)}`,
      },
    });
}
