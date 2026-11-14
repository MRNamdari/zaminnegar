import { ValidateIf } from 'class-validator';

/**
 * Skips the other validators when the property is omitted, but unlike `@IsOptional()` still validates an explicit
 * `null`. Use it for optional properties that are not nullable, so the runtime matches the OpenAPI schema.
 */
export const DefinedIfPresent = (): PropertyDecorator => ValidateIf((_object, value: unknown) => value !== undefined);
