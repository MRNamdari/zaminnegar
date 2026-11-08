import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app.error';

/** The feature does not exist inside the given project. */
export class FeatureNotFoundError
 extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;
  readonly code = 'FEATURE_NOT_FOUND';

  constructor(featureId?: string) {
    super(featureId ? `Feature ${featureId} not found.` : 'Feature not found.');
  }
}
