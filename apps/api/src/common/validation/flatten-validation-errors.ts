import type { ValidationError } from 'class-validator';
import { ValidationErrorDetailDto } from '../dto/validation-error-detail.dto';

/**
 * Flattens class-validator's nested error tree into `{ field, messages }` pairs
 * using dotted paths (`geometry.coordinates`).
 */
export function flattenValidationErrors(errors: ValidationError[], parentPath = ''): ValidationErrorDetailDto[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = error.constraints ? [{ field, messages: Object.values(error.constraints) }] : [];
    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
}
